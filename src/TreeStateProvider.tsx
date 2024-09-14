/**
 * Captures state that is required to be shared between nodes. In particular:
 * - global collapse state for triggering whole tree expansions/closures
 * - the currently editing node (to ensure only one node at a time can be
 *   edited)
 * - the value of the node currently being dragged (so that the target it is
 *   dropped on can act on it)
 */

import React, { createContext, useContext, useState } from 'react'
import { CollectionData, JsonData, ValueData, type CollectionKey } from './types'

interface CollapseAllState {
  path: CollectionKey[]
  collapsed: boolean
}

export interface DragSource {
  path: CollectionKey[] | null
  pathString: string | null
}

interface TreeStateContext {
  collapseState: CollapseAllState | null
  setCollapseState: (collapseState: CollapseAllState | null) => void
  doesPathMatch: (path: CollectionKey[]) => boolean
  currentlyEditingElement: string | null
  setCurrentlyEditingElement: React.Dispatch<React.SetStateAction<string | null>>
  areChildrenBeingEdited: (pathString: string) => boolean
  dragSource: DragSource
  setDragSource: (newState: DragSource) => void
  previousValue: JsonData | undefined
  setPreviousValue: (value: JsonData | undefined) => void
}
const initialContext: TreeStateContext = {
  collapseState: null,
  setCollapseState: () => {},
  doesPathMatch: () => false,
  currentlyEditingElement: null,
  setCurrentlyEditingElement: () => {},
  areChildrenBeingEdited: () => false,
  dragSource: { path: null, pathString: null },
  setDragSource: () => {},
  previousValue: undefined,
  setPreviousValue: () => {},
}

const TreeStateProviderContext = createContext(initialContext)

export const TreeStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [collapseState, setCollapseState] = useState<CollapseAllState | null>(null)
  const [currentlyEditingElement, setCurrentlyEditingElement] = useState<string | null>(null)
  const [dragSource, setDragSource] = useState<DragSource>({
    path: null,
    pathString: null,
  })
  const [previousValue, setPreviousValue] = useState<CollectionData | ValueData | undefined>()

  const doesPathMatch = (path: CollectionKey[]) => {
    if (collapseState === null) return false

    for (const [index, value] of collapseState.path.entries()) {
      if (value !== path[index]) return false
    }

    return true
  }

  const areChildrenBeingEdited = (pathString: string) =>
    currentlyEditingElement !== null && currentlyEditingElement.includes(pathString)

  return (
    <TreeStateProviderContext.Provider
      value={{
        // Collapse
        collapseState,
        setCollapseState: (state) => {
          setCollapseState(state)
          // Reset after 2 seconds, which is enough time for all child nodes to
          // have opened/closed, but still allows collapse reset if data changes
          // externally
          if (state !== null) setTimeout(() => setCollapseState(null), 2000)
        },
        doesPathMatch,
        // Editing
        currentlyEditingElement,
        setCurrentlyEditingElement,
        areChildrenBeingEdited,
        // Drag-n-drop
        dragSource,
        setDragSource,
        previousValue,
        setPreviousValue,
      }}
    >
      {children}
    </TreeStateProviderContext.Provider>
  )
}

export const useTreeState = () => useContext(TreeStateProviderContext)
