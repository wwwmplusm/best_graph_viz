import { create } from 'zustand'

export interface PersonRow {
  id: number
  name: string
  sex: string
  dob: string
  comment: string
  parentId: string
}

interface FamilyStore {
  rows: PersonRow[]
  setRows: (newRows: PersonRow[]) => void
  addRow: () => void
}

export const useFamilyStore = create<FamilyStore>((set, get) => ({
  rows: [
    {
      id: 1,
      name: 'John Smith',
      sex: 'M',
      dob: '1980-05-15',
      comment: 'Father',
      parentId: ''
    },
    {
      id: 2,
      name: 'Jane Smith',
      sex: 'F',
      dob: '1985-08-22',
      comment: 'Mother',
      parentId: ''
    }
  ],
  setRows: (newRows) => set({ rows: newRows }),
  addRow: () => {
    const { rows } = get()
    // Find the highest existing ID and add 1 for the next sequential ID
    const maxId = rows.length > 0 ? Math.max(...rows.map(row => row.id)) : 0
    const nextId = maxId + 1
    
    const newRow: PersonRow = {
      id: nextId,
      name: '',
      sex: '',
      dob: '',
      comment: '',
      parentId: ''
    }
    set({ rows: [...rows, newRow] })
  }
})) 