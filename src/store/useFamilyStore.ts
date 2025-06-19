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
      comment: 'Research Subject',
      parentIds: '1,2',
      spouseIds: '7,8,9',
      ifSubject: 1
    },
    // Tommy's Brothers
    {
      id: 4,
      name: 'Michael Smith',
      sex: 'M',
      dob: '2008-01-20',
      comment: 'Elder brother',
      parentIds: '1,2',
      spouseIds: '',
      ifSubject: 0
    },
    {
      id: 5,
      name: 'David Smith',
      sex: 'M',
      dob: '2012-09-14',
      comment: 'Younger brother',
      parentIds: '1,2',
      spouseIds: '',
      ifSubject: 0
    },
    // Tommy's Sister
    {
      id: 6,
      name: 'Sarah Smith',
      sex: 'F',
      dob: '2009-07-03',
      comment: 'Sister',
      parentIds: '1,2',
      spouseIds: '',
      ifSubject: 0
    },
    // Tommy's Wives
    {
      id: 7,
      name: 'Emma Johnson',
      sex: 'F',
      dob: '2011-04-18',
      comment: 'First wife',
      parentIds: '',
      spouseIds: '3',
      ifSubject: 0
    },
    {
      id: 8,
      name: 'Lisa Brown',
      sex: 'F',
      dob: '2012-11-25',
      comment: 'Second wife',
      parentIds: '',
      spouseIds: '3',
      ifSubject: 0
    },
    {
      id: 9,
      name: 'Maria Garcia',
      sex: 'F',
      dob: '2013-08-07',
      comment: 'Third wife',
      parentIds: '',
      spouseIds: '3',
      ifSubject: 0
    },
    // Children from Tommy's marriages
    {
      id: 10,
      name: 'Alex Smith',
      sex: 'M',
      dob: '2030-02-12',
      comment: 'Son with Emma',
      parentIds: '3,7',
      spouseIds: '',
      ifSubject: 0
    },
    {
      id: 11,
      name: 'Sophie Smith',
      sex: 'F',
      dob: '2031-06-30',
      comment: 'Daughter with Lisa',
      parentIds: '3,8',
      spouseIds: '',
      ifSubject: 0
    },
    {
      id: 12,
      name: 'Carlos Smith',
      sex: 'M',
      dob: '2032-12-08',
      comment: 'Son with Maria',
      parentIds: '3,9',
      spouseIds: '',
      ifSubject: 0
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