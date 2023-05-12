import React, { useEffect, useState } from 'react'
import {
  StringValue,
  NumberValue,
  BooleanValue,
  NullValue,
  ObjectValue,
  InvalidValue,
  ArrayValue,
} from './ValueNodes'
import { EditButtons, InputButtons } from './ButtonPanels'
import { DataType, ValueNodeProps, InputProps, DataTypes, CollectionData } from './types'
import './style.css'

export const ValueNodeWrapper: React.FC<ValueNodeProps> = ({
  data,
  name,
  path,
  onEdit,
  onDelete,
  enableClipboard,
  restrictEditFilter,
  restrictDeleteFilter,
  showArrayIndices,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState<typeof data | CollectionData>(data)
  const [error, setError] = useState<string | null>(null)
  const [dataType, setDataType] = useState<DataType>(getDataType(data))

  useEffect(() => {
    setValue(data)
  }, [data])

  const handleChangeDataType = (type: DataType) => {
    setValue(convertValue(value, type))
    setDataType(type)
  }

  const handleEdit = () => {
    setIsEditing(false)
    const newValue =
      dataType === 'object' ? {} : dataType === 'array' ? (value !== null ? [value] : []) : value
    onEdit(newValue, path).then((result: any) => {
      if (result) {
        setError(result)
        setTimeout(() => setError(null), 3000)
        console.log('Error', result)
      }
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setValue(data)
  }

  const handleDelete = () => {
    onDelete(value, path).then((result: any) => {
      if (result) {
        setError(result)
        setTimeout(() => setError(null), 3000)
        console.log('Error', result)
      }
    })
  }

  const filterProps = { key: name, path, level: path.length, value: data, size: 1 }

  const canEdit = !restrictEditFilter(filterProps)
  const canDelete = !restrictDeleteFilter(filterProps)

  const inputProps = {
    value,
    setValue,
    isEditing,
    setIsEditing,
    handleEdit,
    handleCancel,
    path,
  }

  return (
    <div className="fg-component fg-value-component">
      <div className="fg-value-main-row">
        {showArrayIndices && (
          <label htmlFor={path.join('.')} className="fg-object-key">
            {name}:{' '}
          </label>
        )}
        <div className="fg-input-component">{getInputComponent(dataType, inputProps)}</div>
        {isEditing ? (
          <InputButtons onOk={handleEdit} onCancel={handleCancel} />
        ) : (
          dataType !== 'invalid' && (
            <EditButtons
              startEdit={canEdit ? () => setIsEditing(true) : undefined}
              handleDelete={canDelete ? handleDelete : undefined}
              data={data}
              enableClipboard={enableClipboard}
              name={name}
              path={path}
            />
          )
        )}
        {isEditing && (
          <select
            name={`${name}-type-select`}
            onChange={(e) => handleChangeDataType(e.target.value as DataType)}
            value={dataType}
          >
            {DataTypes.map((type) => (
              <option value={type} key={type}>
                {type}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="fg-value-error-row">
        {error && <span className="fg-error-slug">{error}</span>}
      </div>
    </div>
  )
}

const getDataType = (value: unknown) => {
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  if (value === null) return 'null'
  return 'invalid'
}

const getInputComponent = (dataType: DataType, inputProps: InputProps) => {
  switch (dataType) {
    case 'string':
      return <StringValue {...inputProps} />
    case 'number':
      return <NumberValue {...inputProps} />
    case 'boolean':
      return <BooleanValue {...inputProps} />
    case 'null':
      return <NullValue {...inputProps} />
    case 'object':
      return <ObjectValue {...inputProps} />
    case 'array':
      return <ArrayValue {...inputProps} />
    default:
      return <InvalidValue {...inputProps} />
  }
}

const convertValue = (value: unknown, type: DataType) => {
  switch (type) {
    case 'string':
      return String(value)
    case 'number':
      const n = Number(value)
      return isNaN(n) ? 0 : n
    case 'boolean':
      return !!value
    case 'null':
      return null
    case 'object':
      return {}
    case 'array':
      return [value]
    default:
      return String(value)
  }
}
