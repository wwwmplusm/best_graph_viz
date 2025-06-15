import { create } from 'zustand'

export interface PersonRow {
  id: number
  name: string
  sex: string
  dob: string
  comment: string
  parentIds: string
  spouseIds: string
  ifSubject: number // 1 if subject, 0 if not
}

interface FamilyStore {
  rows: PersonRow[]
  setRows: (newRows: PersonRow[]) => void
  addRow: () => void
  setSubject: (id: number) => void
}

export const useFamilyStore = create<FamilyStore>((set, get) => ({
  rows: [
    {
      id: 1,
      name: 'John Smith',
      sex: 'M',
      dob: '1980-05-15',
      comment: 'Father',
      parentIds: '',
      spouseIds: '2',
      ifSubject: 0
    },
    {
      id: 2,
      name: 'Jane Smith',
      sex: 'F',
      dob: '1985-08-22',
      comment: 'Mother',
      parentIds: '',
      spouseIds: '1',
      ifSubject: 0
    },
    {
      id: 3,
      name: 'Tommy Smith',
      sex: 'M',
      dob: '2010-03-10',
      comment: 'Son - Research Subject',
      parentIds: '1,2',
      spouseIds: '',
      ifSubject: 1
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
      parentIds: '',
      spouseIds: '',
      ifSubject: 0
    }
    set({ rows: [...rows, newRow] })
  },
  setSubject: (id) => {
    const { rows } = get()
    // Set all rows to 0, then set the specified ID to 1
    const updatedRows = rows.map(row => ({
      ...row,
      ifSubject: row.id === id ? 1 : 0
    }))
    set({ rows: updatedRows })
  }
})) 