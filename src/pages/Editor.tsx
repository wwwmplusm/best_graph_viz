import React from 'react'
import { DataGrid, GridColDef, GridRowsProp, GridRowModesModel, GridRowModes, GridRowEditStopReasons, GridRowParams, GridEventListener } from '@mui/x-data-grid'
import { Button, Box, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { useFamilyStore, PersonRow } from '../store/useFamilyStore'

const Editor: React.FC = () => {
  const { rows, setRows, addRow } = useFamilyStore()
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({})

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true
    }
  }

  const processRowUpdate = (newRow: PersonRow) => {
    const updatedRows = rows.map((row) => (row.id === newRow.id ? newRow : row))
    setRows(updatedRows)
    return newRow
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
      field: 'parentId',
      headerName: 'Parent ID',
      width: 100,
      editable: true
    }
  ]

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
      
      <Box sx={{ height: 'calc(100vh - 120px)', width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
        />
      </Box>
    </Box>
  )
}

export default Editor 