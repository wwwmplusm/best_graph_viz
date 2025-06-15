import React from 'react'
import { DataGrid, GridColDef, GridRowsProp, GridRowModesModel, GridRowModes, GridRowEditStopReasons, GridRowParams, GridEventListener } from '@mui/x-data-grid'
import { Button, Box, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { useFamilyStore, PersonRow } from '../store/useFamilyStore'

const Editor: React.FC = () => {
  const { rows, setRows, addRow, setSubject } = useFamilyStore()
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({})

  const processRowUpdate = (newRow: PersonRow) => {
    // If ifSubject is being set to 1, ensure only this row has ifSubject = 1
    if (newRow.ifSubject === 1) {
      const updatedRows = rows.map((row) => ({
        ...row,
        ifSubject: row.id === newRow.id ? 1 : 0
      }))
      // Update the current row with other changes
      const finalRows = updatedRows.map((row) => (row.id === newRow.id ? newRow : row))
      setRows(finalRows)
      return newRow
    } else {
      const updatedRows = rows.map((row) => (row.id === newRow.id ? newRow : row))
      setRows(updatedRows)
      return newRow
    }
  }

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel)
  }

  const handleAddRow = () => {
    // Calculate the next sequential ID
    const maxId = rows.length > 0 ? Math.max(...rows.map(row => row.id)) : 0
    const nextId = maxId + 1
    
    addRow()
    // Put the new row into edit mode immediately
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [nextId]: { mode: GridRowModes.Edit }
    }))
  }

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      editable: false
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 150,
      editable: true
    },
    {
      field: 'sex',
      headerName: 'Sex',
      width: 80,
      editable: true
    },
    {
      field: 'dob',
      headerName: 'DOB',
      type: 'date',
      width: 120,
      editable: true,
      valueGetter: (params) => {
        return params ? new Date(params) : null
      }
    },
    {
      field: 'comment',
      headerName: 'Comment',
      width: 200,
      editable: true
    },
    {
      field: 'parentIds',
      headerName: 'Parent IDs',
      width: 120,
      editable: true,
      renderCell: (params) => (
        <div title="Comma-separated parent IDs (e.g., 1,2)">
          {params.value}
        </div>
      )
    },
    {
      field: 'spouseIds',
      headerName: 'Spouse IDs',
      width: 120,
      editable: true,
      renderCell: (params) => (
        <div title="Comma-separated spouse IDs (e.g., 3,4)">
          {params.value}
        </div>
      )
    },
    {
      field: 'ifSubject',
      headerName: 'Subject',
      width: 100,
      editable: true,
      type: 'singleSelect',
      valueOptions: [
        { value: 0, label: 'No' },
        { value: 1, label: 'Yes' }
      ],
      renderCell: (params) => (
        <div style={{ 
          color: params.value === 1 ? '#d32f2f' : '#666',
          fontWeight: params.value === 1 ? 'bold' : 'normal'
        }}>
          {params.value === 1 ? 'SUBJECT' : 'No'}
        </div>
      ),
      renderEditCell: (params) => {
        const currentSubjectCount = rows.filter(row => row.ifSubject === 1).length
        const isCurrentSubject = params.row.ifSubject === 1
        
        return (
          <select
            value={params.value}
            onChange={(e) => {
              const newValue = parseInt(e.target.value)
              params.api.setEditCellValue({
                id: params.id,
                field: params.field,
                value: newValue
              })
            }}
            style={{ width: '100%', padding: '4px' }}
          >
            <option value={0}>No</option>
            <option 
              value={1} 
              disabled={currentSubjectCount >= 1 && !isCurrentSubject}
              title={currentSubjectCount >= 1 && !isCurrentSubject ? 'Only one subject allowed' : ''}
            >
              Yes
            </option>
          </select>
        )
      }
    }
  ]

  // Count current subjects for validation display
  const subjectCount = rows.filter(row => row.ifSubject === 1).length
  const currentSubject = rows.find(row => row.ifSubject === 1)

  return (
    <Box sx={{ height: '100vh', width: '100%', p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4" component="h1">
          Family Tree Editor
        </Typography>
        <Button
          variant="contained"
          onClick={handleAddRow}
          sx={{ ml: 'auto' }}
        >
          Add Row
        </Button>
        <Button
          component={Link}
          to="/visualize"
          variant="outlined"
          color="secondary"
        >
          Visualize
        </Button>
      </Box>

      {/* Subject Status Display */}
      <Box sx={{ mb: 2, p: 2, bgcolor: subjectCount === 1 ? '#e8f5e8' : '#fff3e0', borderRadius: 1, border: '1px solid #ddd' }}>
        <Typography variant="subtitle2" gutterBottom>
          Research Subject Status:
        </Typography>
        {subjectCount === 0 && (
          <Typography variant="body2" color="warning.main">
            ⚠️ No research subject selected. Please mark one person as the subject.
          </Typography>
        )}
        {subjectCount === 1 && currentSubject && (
          <Typography variant="body2" color="success.main">
            ✅ Subject: <strong>{currentSubject.name}</strong> (ID: {currentSubject.id})
          </Typography>
        )}
        {subjectCount > 1 && (
          <Typography variant="body2" color="error.main">
            ❌ Multiple subjects detected! Only one person should be marked as subject.
          </Typography>
        )}
      </Box>
      
      <Box sx={{ height: 'calc(100vh - 200px)', width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          processRowUpdate={processRowUpdate}
        />
      </Box>
    </Box>
  )
}

export default Editor 