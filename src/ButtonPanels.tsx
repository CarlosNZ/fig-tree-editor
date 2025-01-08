import React, { useState } from 'react'
import { Icon } from './Icons'
import { useTheme } from './contexts'
import { type TranslateFunction } from './localisation'
import {
  type CollectionKey,
  type CollectionDataType,
  type CopyFunction,
  type CopyType,
  type NodeData,
  type CustomButtonDefinition,
  type KeyboardControlsFull,
} from './types'
import { getModifier } from './helpers'

interface EditButtonProps {
  startEdit?: () => void
  handleDelete?: () => void
  enableClipboard: boolean | CopyFunction
  handleAdd?: (newKey: string) => void
  type?: CollectionDataType
  nodeData: NodeData
  translate: TranslateFunction
  customButtons: CustomButtonDefinition[]
  keyboardControls: KeyboardControlsFull
  handleKeyboard: (
    e: React.KeyboardEvent,
    eventMap: Partial<Record<keyof KeyboardControlsFull, () => void>>
  ) => void
}

export const EditButtons: React.FC<EditButtonProps> = ({
  startEdit,
  handleDelete,
  handleAdd,
  enableClipboard,
  type,
  customButtons,
  nodeData,
  translate,
  keyboardControls,
  handleKeyboard,
}) => {
  const { getStyles } = useTheme()
  const NEW_KEY_PROMPT = translate('KEY_NEW', nodeData)
  const [isAdding, setIsAdding] = useState(false)
  const [newKey, setNewKey] = useState(NEW_KEY_PROMPT)

  const { key, path, value: data } = nodeData

  const handleKeyPress = (e: React.KeyboardEvent) => {
    handleKeyboard(e, {
      stringConfirm: () => {
        if (handleAdd) {
          setIsAdding(false)
          handleAdd(newKey)
          setNewKey(NEW_KEY_PROMPT)
        }
      },
      cancel: () => {
        setIsAdding(false)
        setNewKey(NEW_KEY_PROMPT)
      },
    })
  }

  const handleCopy = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    let copyType: CopyType = 'value'
    let value
    let stringValue = ''
    if (enableClipboard) {
      const modifier = getModifier(e)
      if (modifier && keyboardControls.clipboardModifier.includes(modifier)) {
        value = stringifyPath(path)
        stringValue = value
        copyType = 'path'
      } else {
        value = data
        stringValue = type ? JSON.stringify(data, null, 2) : String(value)
      }
      void navigator.clipboard.writeText(stringValue)
    }
    if (typeof enableClipboard === 'function') {
      enableClipboard({ value, stringValue, path, key, type: copyType })
    }
  }

  return (
    <div className="jer-edit-buttons" style={{ opacity: isAdding ? 1 : undefined }}>
      {enableClipboard && (
        <div onClick={handleCopy} className="jer-copy-pulse">
          <Icon name="copy" nodeData={nodeData} />
        </div>
      )}
      {startEdit && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            startEdit()
          }}
        >
          <Icon name="edit" nodeData={nodeData} />
        </div>
      )}
      {handleDelete && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
        >
          <Icon name="delete" nodeData={nodeData} />
        </div>
      )}
      {handleAdd && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            if (type === 'object') setIsAdding(true)
            // For arrays, we don't need to add a key
            else handleAdd('')
          }}
        >
          <Icon name="add" nodeData={nodeData} />
        </div>
      )}
      {customButtons?.map(({ Element, onClick }, i) => (
        <div key={i} onClick={(e) => onClick && onClick(nodeData, e)}>
          <Element nodeData={nodeData} />
        </div>
      ))}
      {isAdding && handleAdd && type === 'object' && (
        <>
          <input
            className="jer-input-new-key"
            type="text"
            name="new-object-key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            autoFocus
            onFocus={(e) => e.target.select()}
            onKeyDown={handleKeyPress}
            style={getStyles('input', nodeData)}
          />
          <InputButtons
            onOk={(e) => {
              if (newKey) {
                e.stopPropagation()
                setIsAdding(false)
                handleAdd(newKey)
              }
            }}
            onCancel={(e) => {
              e.stopPropagation()
              setIsAdding(false)
            }}
            nodeData={nodeData}
          />
        </>
      )}
    </div>
  )
}

export const InputButtons: React.FC<{
  onOk: (e: React.MouseEvent<HTMLElement>) => void
  onCancel: (e: React.MouseEvent<HTMLElement>) => void
  nodeData: NodeData
}> = ({ onOk, onCancel, nodeData }) => {
  return (
    <div className="jer-confirm-buttons">
      <div onClick={onOk}>
        <Icon name="ok" nodeData={nodeData} />
      </div>
      <div onClick={onCancel}>
        <Icon name="cancel" nodeData={nodeData} />
      </div>
    </div>
  )
}

const stringifyPath = (path: CollectionKey[]): string =>
  path.reduce((str: string, part) => {
    if (typeof part === 'number') return `${str}[${part}]`
    else return str === '' ? part : `${str}.${part}`
  }, '')
