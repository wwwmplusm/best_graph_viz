import React from 'react'
import CytoscapeComponent from 'react-cytoscapejs'
import { Box, Typography, Button } from '@mui/material'
import { Link } from 'react-router-dom'
import { useFamilyStore, PersonRow } from '../store/useFamilyStore'

const Visualise: React.FC = () => {
  const { rows } = useFamilyStore()

  // Helper function to convert rows to Cytoscape elements
  const rowsToCy = (rows: PersonRow[]) => {
    const elements: any[] = []

    // Add nodes
    rows.forEach(row => {
      elements.push({
        data: {
          id: row.id.toString(),
          label: row.name || `#${row.id}`
        }
      })
    })

    // Add edges for parent-child relationships
    rows.forEach(row => {
      if (row.parentId && row.parentId.trim() !== '') {
        elements.push({
          data: {
            id: `${row.parentId}-${row.id}`,
            source: row.parentId.toString(),
            target: row.id.toString()
          }
        })
      }
    })

    return elements
  }

  const elements = rowsToCy(rows)

  const stylesheet = [
    {
      selector: 'node',
      style: {
        'background-color': (ele: any) => {
          // Find the row data to determine sex
          const nodeId = parseInt(ele.data('id'))
          const row = rows.find(r => r.id === nodeId)
          return row?.sex === 'F' ? '#FF69B4' : '#1976D2' // Pink if female, blue otherwise
        },
        'label': 'data(label)',
        'color': '#FFFFFF', // White text
        'text-valign': 'center',
        'text-halign': 'center',
        'shape': 'round-rectangle', // Rounded pill shape
        'width': '120px',
        'height': '40px',
        'font-size': '12px',
        'font-family': 'system-ui, sans-serif',
        'text-wrap': 'wrap',
        'text-max-width': '100px'
      }
    },
    {
      selector: 'edge',
      style: {
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle', // Triangle arrow
        'target-arrow-color': '#666666', // Grey
        'line-color': '#666666', // Grey line
        'width': 2
      }
    }
  ]

  const layout = {
    name: 'breadthfirst',
    directed: true, // Generations appear in layers
    padding: 30,
    spacingFactor: 1.5,
    avoidOverlap: true,
    roots: rows.filter(row => !row.parentId || row.parentId.trim() === '').map(row => row.id.toString())
  }

  return (
    <Box sx={{ height: '100vh', width: '100%', p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4" component="h1">
          Family Tree Visualization
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="outlined"
          sx={{ ml: 'auto' }}
        >
          Back to Editor
        </Button>
      </Box>
      
      <Box sx={{ height: '90vh', width: '100%', border: '1px solid #ccc', borderRadius: 1 }}>
        <CytoscapeComponent
          elements={elements}
          style={{ width: '100%', height: '100%' }}
          stylesheet={stylesheet}
          layout={layout}
          cy={(cy) => {
            cy.fit()
            cy.center()
          }}
        />
      </Box>
    </Box>
  )
}

export default Visualise 