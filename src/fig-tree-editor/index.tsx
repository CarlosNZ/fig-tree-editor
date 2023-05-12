import { useState } from 'react'
import clone from 'just-clone'
import { CollectionNode } from './CollectionNodes'
import { EditorProps, FilterMethod, OnChangeMethod } from './types'
import './style.css'
import { useTheme, defaultTheme } from './theme'

const JsonEditor: React.FC<EditorProps> = ({
  data: srcData,
  schema,
  rootName = 'root',
  onUpdate,
  onEdit: srcEdit = onUpdate,
  onDelete: srcDelete = onUpdate,
  onAdd: srcAdd = onUpdate,
  enableClipboard = true,
  theme = defaultTheme,
  style = {},
  indent = 2,
  collapse = false,
  restrictEdit = false,
  restrictDelete = false,
  restrictAdd = false,
  keySort,
  defaultValue = null,
}) => {
  const [data, setData] = useState<object>(srcData)

  useTheme(theme)

  const onEdit: OnChangeMethod = async (value, path) => {
    const { currentData, newData, currentValue, newValue } = updateDataObject(
      data,
      path,
      value,
      'update'
    )
    if (srcEdit) {
      const result = await srcEdit({
        currentData,
        newData,
        currentValue,
        newValue,
        name: path.slice(-1)[0],
        path,
      })
      if (result !== false) setData(newData)
      if (result === false) return 'Update unsuccessful'
    } else setData(newData)
  }

  const onDelete: OnChangeMethod = async (value, path) => {
    const { currentData, newData, currentValue, newValue } = updateDataObject(
      data,
      path,
      value,
      'delete'
    )
    if (srcDelete) {
      const result = await srcDelete({
        currentData,
        newData,
        currentValue,
        newValue,
        name: path.slice(-1)[0],
        path,
      })
      if (result !== false) setData(newData)
      if (result === false) return 'Update unsuccessful'
    } else setData(newData)
  }

  const onAdd: OnChangeMethod = async (value, path) => {
    const { currentData, newData, currentValue, newValue } = updateDataObject(
      data,
      path,
      value,
      'update'
    )
    if (srcAdd) {
      const result = await srcAdd({
        currentData,
        newData,
        currentValue,
        newValue,
        name: path.slice(-1)[0],
        path,
      })
      if (result !== false) setData(newData)
      if (result === false) return 'Adding node unsuccessful'
    } else setData(newData)
  }

  const collapseFilter = getFilterMethod(collapse)

  const otherProps = {
    name: rootName,
    onEdit,
    onDelete,
    onAdd,
    collapseFilter,
    enableClipboard,
    style,
    indent,
  }

  return (
    <div className="fg-editor-container" style={style}>
      {Array.isArray(data) && <p>Array component</p>}
      {isCollection(data) && <CollectionNode data={data} path={[]} {...otherProps} />}
    </div>
  )
}

export const isCollection = (value: unknown) => value !== null && typeof value == 'object'

const updateDataObject = (
  data: object,
  path: (string | number)[],
  newValue: unknown,
  action: 'update' | 'delete'
) => {
  if (path.length === 0) {
    return {
      currentData: data,
      newData: newValue as object,
      currentValue: data,
      newValue: newValue,
    }
  }

  const newData = clone(data)

  let d = newData
  let currentValue
  for (let i = 0; i < path.length; i++) {
    const part = path[i]
    if (i === path.length - 1) {
      currentValue = (d as any)[part]
      // @ts-ignore
      if (action === 'update') d[part] = newValue
      // @ts-ignore
      if (action === 'delete') delete d[part]
    }
    d = (d as any)[part]
  }
  return {
    currentData: data,
    newData,
    currentValue,
    newValue: action === 'update' ? newValue : undefined,
  }
}

const getFilterMethod = (collapse: boolean | number | FilterMethod): FilterMethod => {
  if (typeof collapse === 'boolean') return () => collapse
  if (typeof collapse === 'number') return ({ level }) => level >= collapse
  return collapse
}

export default JsonEditor
