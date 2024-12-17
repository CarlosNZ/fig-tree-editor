import React, { useCallback, useEffect, useMemo, useState } from 'react'
import assign, { type Input } from 'object-property-assigner'
import extract from 'object-property-extractor'
import { CollectionNode } from './CollectionNode'
import { isCollection, matchNode, matchNodeKey } from './helpers'
import {
  type CollectionData,
  type JsonEditorProps,
  type FilterFunction,
  type InternalUpdateFunction,
  type NodeData,
  type SearchFilterFunction,
  type CollectionKey,
  type UpdateFunctionReturn,
  type UpdateFunction,
  type UpdateFunctionProps,
  type JsonData,
} from './types'
import { useTheme, ThemeProvider, TreeStateProvider } from './contexts'
import { useData } from './hooks/useData'
import { getTranslateFunction } from './localisation'
import { ValueNodeWrapper } from './ValueNodeWrapper'
import './style.css'

const Editor: React.FC<JsonEditorProps> = ({
  data: srcData,
  setData: srcSetData,
  rootName = 'root',
  onUpdate = () => {},
  onEdit: srcEdit = onUpdate,
  onDelete: srcDelete = onUpdate,
  onAdd: srcAdd = onUpdate,
  onChange,
  onError,
  showErrorMessages = true,
  enableClipboard = true,
  indent = 2,
  collapse = false,
  collapseAnimationTime = 300, // must be equivalent to CSS value
  showCollectionCount = true,
  restrictEdit = false,
  restrictDelete = false,
  restrictAdd = false,
  restrictTypeSelection = false,
  restrictDrag = true,
  searchFilter: searchFilterInput,
  searchText,
  searchDebounceTime = 350,
  keySort = false,
  showArrayIndices = true,
  showStringQuotes = true,
  defaultValue = null,
  minWidth = 250,
  maxWidth = 'min(600px, 90vw)',
  rootFontSize,
  stringTruncate = 250,
  translations = {},
  className,
  id,
  customText = {},
  customNodeDefinitions = [],
  customButtons = [],
  jsonParse = JSON.parse,
  jsonStringify = (data: JsonData) => JSON.stringify(data, null, 2),
  errorMessageTimeout = 2500,
}) => {
  const { getStyles } = useTheme()
  const collapseFilter = useCallback(getFilterFunction(collapse), [collapse])
  const translate = useCallback(getTranslateFunction(translations, customText), [
    translations,
    customText,
  ])
  const [debouncedSearchText, setDebouncedSearchText] = useState(searchText)

  const [data, setData] = useData<JsonData>({ setData: srcSetData, data: srcData })

  const docRoot = document.querySelector(':root') as HTMLElement
  const transitionTime = getComputedStyle(document.documentElement).getPropertyValue(
    '--jer-expand-transition-time'
  )
  if (parseFloat(transitionTime) * 1000 !== collapseAnimationTime) {
    docRoot?.style.setProperty('--jer-expand-transition-time', `${collapseAnimationTime / 1000}s`)
  }

  useEffect(() => {
    const debounce = setTimeout(() => setDebouncedSearchText(searchText), searchDebounceTime)
    return () => clearTimeout(debounce)
  }, [searchText, searchDebounceTime])

  const nodeData: NodeData = {
    key: rootName,
    path: [],
    level: 0,
    index: 0,
    value: data,
    size: typeof data === 'object' && data !== null ? Object.keys(data).length : 1,
    parentData: null,
    fullData: data,
  }

  // Common method for handling data update. It runs the updated data through
  // provided "onUpdate" function, then updates data state or returns error
  // information accordingly
  const handleEdit = async (updateMethod: UpdateFunction, input: UpdateFunctionProps) => {
    const result = await updateMethod(input)

    if (result === true || result === undefined) {
      setData(input.newData)
      return
    }

    const returnTuple = isUpdateReturnTuple(result) ? result : ['error', result]
    const [type, resultValue] = returnTuple

    if (type === 'error') {
      setData(input.currentData)
      return resultValue === false ? translate('ERROR_UPDATE', nodeData) : String(resultValue)
    }

    setData(resultValue)
  }

  const onEdit: InternalUpdateFunction = async (value, path) => {
    const { currentData, newData, currentValue, newValue } = updateDataObject(
      data,
      path,
      value,
      'update'
    )
    if (currentValue === newValue) return

    return await handleEdit(srcEdit, {
      currentData,
      newData,
      currentValue,
      newValue,
      name: path.slice(-1)[0],
      path,
    })
  }

  const onDelete: InternalUpdateFunction = async (value, path) => {
    const { currentData, newData, currentValue, newValue } = updateDataObject(
      data,
      path,
      value,
      'delete'
    )

    return await handleEdit(srcDelete, {
      currentData,
      newData,
      currentValue,
      newValue,
      name: path.slice(-1)[0],
      path,
    })
  }

  const onAdd: InternalUpdateFunction = async (value, path) => {
    const { currentData, newData, currentValue, newValue } = updateDataObject(
      data,
      path,
      value,
      'add'
    )

    return await handleEdit(srcAdd, {
      currentData,
      newData,
      currentValue,
      newValue,
      name: path.slice(-1)[0],
      path,
    })
  }

  // "onMove" is just a "Delete" followed by an "Add", but we combine into a
  // single "action" and only run one "onUpdate", which also means it'll be
  // registered as a single event in the "Undo" queue.
  // If either action returns an error, we reset the data the same way we do
  // when a single action returns error.
  const onMove = async (
    sourcePath: CollectionKey[] | null,
    destPath: CollectionKey[],
    position: 'above' | 'below'
  ) => {
    if (sourcePath === null) return
    const { currentData, newData, currentValue } = updateDataObject(data, sourcePath, '', 'delete')

    // Immediate key of the item being moved
    const originalKey = sourcePath.slice(-1)[0]
    // Where it's going
    const targetPath = destPath.slice(0, -1)
    // The key in the target path to insert before or after
    const insertPos = destPath.slice(-1)[0]

    let targetKey =
      typeof insertPos === 'number' // Moving TO an array
        ? position === 'above'
          ? insertPos
          : insertPos + 1
        : typeof originalKey === 'number'
        ? `arr_${originalKey}` // Moving FROM an array, so needs a key
        : originalKey // Moving from object to object

    const sourceBase = sourcePath.slice(0, -1).join('.')
    const destBase = destPath.slice(0, -1).join('.')

    if (
      sourceBase === destBase &&
      typeof originalKey === 'number' &&
      typeof targetKey === 'number' &&
      originalKey < targetKey
    ) {
      targetKey -= 1
    }

    const insertOptions =
      typeof targetKey === 'number'
        ? { insert: true }
        : position === 'above'
        ? { insertBefore: insertPos }
        : { insertAfter: insertPos }

    const { newData: addedData, newValue: addedValue } = updateDataObject(
      newData,
      [...targetPath, targetKey],
      currentValue,
      'add',
      insertOptions as AssignOptions
    )

    return await handleEdit(srcEdit, {
      currentData,
      newData: addedData,
      currentValue,
      newValue: addedValue,
      name: destPath.slice(-1)[0],
      path: destPath,
    })
  }

  const restrictEditFilter = useMemo(() => getFilterFunction(restrictEdit), [restrictEdit])
  const restrictDeleteFilter = useMemo(() => getFilterFunction(restrictDelete), [restrictDelete])
  const restrictAddFilter = useMemo(() => getFilterFunction(restrictAdd), [restrictAdd])
  const restrictDragFilter = useMemo(() => getFilterFunction(restrictDrag), [restrictDrag])
  const searchFilter = useMemo(() => getSearchFilter(searchFilterInput), [searchFilterInput])

  const otherProps = {
    name: rootName,
    nodeData,
    onEdit,
    onDelete,
    onAdd,
    onChange,
    onError,
    showErrorMessages,
    onMove,
    showCollectionCount,
    collapseFilter,
    collapseAnimationTime,
    restrictEditFilter,
    restrictDeleteFilter,
    restrictAddFilter,
    restrictTypeSelection,
    restrictDragFilter,
    canDragOnto: false, // can't drag onto outermost container
    searchFilter,
    searchText: debouncedSearchText,
    enableClipboard,
    keySort,
    showArrayIndices,
    showStringQuotes,
    indent,
    defaultValue,
    stringTruncate,
    translate,
    customNodeDefinitions,
    customButtons,
    parentData: null,
    jsonParse,
    jsonStringify,
    errorMessageTimeout,
  }

  const mainContainerStyles = { ...getStyles('container', nodeData), minWidth, maxWidth }

  // Props fontSize takes priority over theme, but we fall back on a default of
  // 16 (from CSS sheet) if neither are provided. Having a defined base size
  // ensures the component doesn't have its fontSize affected from the parent
  // environment
  mainContainerStyles.fontSize = rootFontSize ?? mainContainerStyles.fontSize

  return (
    <div id={id} className={'jer-editor-container ' + className} style={mainContainerStyles}>
      {isCollection(data) ? (
        <CollectionNode data={data} {...otherProps} />
      ) : (
        <ValueNodeWrapper data={data as any} showLabel {...otherProps} />
      )}
    </div>
  )
}

export const JsonEditor: React.FC<JsonEditorProps> = (props) => {
  return (
    <ThemeProvider theme={props.theme} icons={props.icons}>
      <TreeStateProvider>
        <Editor {...props} />
      </TreeStateProvider>
    </ThemeProvider>
  )
}

interface AssignOptions {
  remove?: boolean
  insert?: true
  insertBefore?: string
  insertAfter?: string
}

const updateDataObject = (
  data: JsonData,
  path: Array<string | number>,
  newValue: unknown,
  action: 'update' | 'delete' | 'add',
  insertOptions: { insert?: true; insertBefore?: string; insertAfter?: string } = {}
) => {
  if (path.length === 0) {
    return {
      currentData: data,
      newData: newValue as CollectionData,
      currentValue: data,
      newValue,
    }
  }

  const assignOptions: AssignOptions = {
    remove: action === 'delete',
    ...insertOptions,
  }

  const currentValue = action !== 'add' ? extract(data, path) : undefined
  const newData = assign(data as Input, path, newValue, assignOptions)

  return {
    currentData: data,
    newData,
    currentValue,
    newValue: action !== 'delete' ? newValue : undefined,
  }
}

const getFilterFunction = (propValue: boolean | number | FilterFunction): FilterFunction => {
  if (typeof propValue === 'boolean') return () => propValue
  if (typeof propValue === 'number') return ({ level }) => level >= propValue
  return propValue
}

const getSearchFilter = (
  searchFilterInput: 'key' | 'value' | 'all' | SearchFilterFunction | undefined
): SearchFilterFunction | undefined => {
  if (searchFilterInput === undefined) return undefined
  if (searchFilterInput === 'value') {
    return matchNode as SearchFilterFunction
  }
  if (searchFilterInput === 'key') {
    return matchNodeKey
  }
  if (searchFilterInput === 'all') {
    return (inputData, searchText) =>
      matchNode(inputData, searchText) || matchNodeKey(inputData, searchText)
  }
  return searchFilterInput
}

const isUpdateReturnTuple = (
  input: UpdateFunctionReturn | string | boolean | undefined
): input is UpdateFunctionReturn => {
  return Array.isArray(input) && input.length === 2 && ['error', 'value'].includes(input[0])
}
