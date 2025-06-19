import React, { useState, useEffect, useRef } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'
import { Box, Typography, Button, Paper, Chip } from '@mui/material'
import { Link } from 'react-router-dom'
import { useFamilyStore } from '../store/useFamilyStore'
import { parseFamilyTree } from '../utils/tableParser'
import { treeTheme, getNodeColor, getTextColor, getBorderColor } from '../styles/treeTheme'
import cytoscape from 'cytoscape'
// @ts-ignore – plugin has no TS typings
import svgExport from 'cytoscape-svg'

const NODE_WIDTH = 150
const NODE_HEIGHT = 80

// register SVG export plugin only once
svgExport(cytoscape)

const Visualise: React.FC = () => {
  const { rows } = useFamilyStore()
  const [cytoscapeData, setCytoscapeData] = useState<any>(null)
  const cyRef = useRef<any>(null)

  useEffect(() => {
    setCytoscapeData(parseFamilyTree(rows))
  }, [rows])

  const enhanceNodeData = (nodes: any[], subject: any) => {
    if (!nodes) return []
    return nodes.map(node => {
      if (node.data.type !== 'person') return node
      const person = rows.find(r => r.id.toString() === node.data.id)
      if (!person) return node
      const fullLabel = [person.name, person.dob].filter(Boolean).join('\n')
      return { ...node, data: { ...node.data, label: fullLabel, isSubject: person.ifSubject === 1 } }
    })
  }

  const stylesheet = [
    {
      selector: 'node[type="person"]',
      style: {
        'background-color': (ele: any) => getNodeColor(ele.data('isSubject'), false),
        label: 'data(label)',
        color: (ele: any) => getTextColor(ele.data('isSubject'), false),
        'text-valign': 'center',
        'text-halign': 'center',
        shape: 'round-rectangle',
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        'font-size': treeTheme.typography.detailFontSize,
        'font-family': treeTheme.typography.fontFamily,
        'text-wrap': 'wrap',
        'text-max-width': NODE_WIDTH - 20,
        'border-width': treeTheme.layout.borderWidth,
        'border-color': (ele: any) => getBorderColor(ele.data('isSubject'), false)
      }
    },
    {
      selector: "node[type='junction']",
      style: {
        width: 0.01,
        height: 0.01,
        'background-opacity': 0,
        'border-width': 0,
        'opacity': 0
      }
    },
    {
      selector: 'edge',
      style: {
        'curve-style': 'straight',
        'line-color': treeTheme.colors.edge,
        width: treeTheme.edges.width,
        'target-arrow-shape': 'none'
      }
    }
  ]

  const presetLayout = { name: 'preset', fit: true, padding: 50 }

  if (!cytoscapeData) return <Typography>Loading...</Typography>

  const elements = [
    ...enhanceNodeData(cytoscapeData.nodes, cytoscapeData.subject),
    ...cytoscapeData.edges
  ]

  return (
    <Box sx={{ height: '100vh', width: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <Typography variant="h4" component="h1">
          Family Tree
        </Typography>
        {cytoscapeData.subject && <Chip label={`Subject: ${cytoscapeData.subject.name}`} />}
        <Button component={Link} to="/" variant="outlined" sx={{ ml: 'auto' }}>
          Back to Editor
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            if (!cyRef.current) return
            const png = cyRef.current.png({ full: true, scale: 4, bg: '#FFFFFF' })
            const link = document.createElement('a')
            link.href = png
            link.download = 'family-tree.png'
            link.click()
          }}
        >
          Export&nbsp;PNG&nbsp;×4
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            if (!cyRef.current) return
            const svgContent = cyRef.current.svg({ full: true })
            const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'family-tree.svg'
            link.click()
            URL.revokeObjectURL(url)
          }}
        >
          Export&nbsp;SVG
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <Paper sx={{ height: '100%', bgcolor: treeTheme.colors.background }}>
          <CytoscapeComponent
            elements={elements as any}
            style={{ width: '100%', height: '100%' }}
            stylesheet={stylesheet as any}
            layout={presetLayout}
            cy={cy => {
              cyRef.current = cy
              // Configure renderer for high-DPI screens when supported
              const renderer = cy.renderer()
              if (renderer) {
                // In recent Cytoscape versions `options` may be an object instead of a function
                const opts: any = (renderer as any).options
                if (typeof opts === 'function') {
                  // Older API: options is a setter/getter function
                  opts({ pixelRatio: 'auto', motionBlur: false, textureOnViewport: false })
                } else if (typeof opts === 'object' && opts !== null) {
                  // Newer API: options is a plain object
                  Object.assign(opts, {
                    pixelRatio: 'auto',
                    motionBlur: false,
                    textureOnViewport: false
                  })
                }
              }
               
              cy.fit(cy.elements(), 50)
              cy.center()
            }}
          />
        </Paper>
      </Box>
    </Box>
  )
}

export default Visualise 