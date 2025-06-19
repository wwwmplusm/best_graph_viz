import React, { useState, useEffect } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import elk from 'cytoscape-elk'
import { Box, Typography, Button, Paper, Accordion, AccordionSummary, AccordionDetails, Chip } from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { useFamilyStore } from '../store/useFamilyStore'
import { parseFamilyTree, validateFamilyTree } from '../utils/tableParser'
import { FamilyRelationships } from '../utils/relationshipCalculator'
import { treeTheme, getNodeColor, getTextColor, getBorderColor, formatDate, getRelationshipToSubject } from '../styles/treeTheme'

// Register layouts
cytoscape.use(dagre)
cytoscape.use(elk)

const Visualise: React.FC = () => {
  const { rows } = useFamilyStore()
  const [cytoscapeData, setCytoscapeData] = useState<any>(null)
  const [relationships, setRelationships] = useState<FamilyRelationships | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [useElkLayout, setUseElkLayout] = useState<boolean>(true)

  useEffect(() => {
    // Validate data first
    const errors = validateFamilyTree(rows)
    setValidationErrors(errors)

    // Parse family tree data
    const parsedData = parseFamilyTree(rows)
    setCytoscapeData(parsedData)
    setRelationships(parsedData.relationships || null)
  }, [rows])

  // Enhanced node content with relationship to subject
  const enhanceNodeData = (nodes: any[], subject: any, relationships: any[]) => {
    return nodes.map(node => {
      const person = rows.find(r => r.id.toString() === node.data.id)
      if (!person) return node

      const relationshipToSubject = subject 
        ? getRelationshipToSubject(node.data.id, subject.id.toString(), relationships || [], rows)
        : 'Unknown'

      // Create multi-line label with all required information
      const nameLabel = person.name || 'Unknown'
      const dobLabel = person.dob ? formatDate(person.dob) : '' // Remove "DOB:" prefix
      const relationLabel = relationshipToSubject
      const commentLabel = person.comment || ''

      // Show comment unless it's exactly the same as relationship or just says "subject"
      const shouldShowComment = commentLabel && 
        commentLabel.toLowerCase() !== relationLabel.toLowerCase() &&
        !commentLabel.toLowerCase().includes('research subject') &&
        commentLabel.toLowerCase() !== 'subject'

      // Combine all labels with line breaks
      const fullLabel = [nameLabel, dobLabel, relationLabel, shouldShowComment ? commentLabel : '']
        .filter(label => label.trim() !== '')
        .join('\n')

      return {
        ...node,
        data: {
          ...node.data,
          label: fullLabel,
          originalName: nameLabel,
          dob: dobLabel,
          relationship: relationLabel,
          comment: commentLabel
        }
      }
    })
  }

  const stylesheet = [
    {
      selector: 'node',
      style: {
        'background-color': (ele: any) => {
          const isSubject = ele.data('isSubject')
          const nodeId = ele.data('id')
          
          // For now, only the subject gets the dark color, everyone else gets gold
          const person = rows.find(r => r.id.toString() === nodeId)
          const isSpouse = false  // Temporarily disable spouse coloring to show gold nodes
          
          return getNodeColor(isSubject, isSpouse)
        },
        'label': 'data(label)',
        'color': (ele: any) => {
          const isSubject = ele.data('isSubject')
          const nodeId = ele.data('id')
          const person = rows.find(r => r.id.toString() === nodeId)
          const isSpouse = false  // Temporarily disable spouse coloring to show gold nodes
          
          return getTextColor(isSubject, isSpouse)
        },
        'text-valign': 'center',
        'text-halign': 'center',
        'shape': 'round-rectangle',
        'width': `${treeTheme.layout.nodeWidth}px`,
        'height': `${treeTheme.layout.nodeHeight}px`,
        'font-size': treeTheme.typography.detailFontSize,
        'font-family': treeTheme.typography.fontFamily,
        'font-weight': treeTheme.typography.fontWeight,
        'text-wrap': 'wrap',
        'text-max-width': `${treeTheme.layout.nodeWidth - 20}px`,
        'border-width': treeTheme.layout.borderWidth,
        'border-color': (ele: any) => {
          const isSubject = ele.data('isSubject')
          const nodeId = ele.data('id')
          const person = rows.find(r => r.id.toString() === nodeId)
          const isSpouse = false  // Temporarily disable spouse coloring to show gold nodes
          
          return getBorderColor(isSubject, isSpouse)
        },
        'border-style': 'solid',
        'text-margin-y': 0,
        'text-justification': 'center'
      }
    },
    {
      selector: 'edge',
      style: {
        'curve-style': 'bezier',             // Smooth curved edges
        'line-color': treeTheme.colors.edge,
        'width': treeTheme.edges.width,
        'target-arrow-shape': 'none',
        'source-arrow-shape': 'none',
        'label': '',
        'edge-text-rotation': 'none',
        'line-style': 'solid'
      }
    },
    {
      selector: 'edge[type="parent"]',
      style: {
        'line-color': treeTheme.colors.edge,
        'curve-style': 'bezier',             // Smooth curved parent-child edges
        'width': 2,
        'line-style': 'solid',
        'target-arrow-shape': 'triangle-small',
        'target-arrow-color': treeTheme.colors.edge,
        'arrow-scale': 0.8
      }
    },
    {
      selector: 'edge[type="spouse"]',
      style: {
        'line-color': treeTheme.colors.edge,   // Use black color for spouse edges
        'curve-style': 'straight',           // Keep spouse edges straight
        'width': 3,
        'line-style': 'solid',
        'target-arrow-shape': 'none',
        'source-arrow-shape': 'none'
      }
    }
  ]

  // ELK layout for superior orthogonal routing
  const elkLayout = {
    name: 'elk',
    elk: {
      algorithm: 'layered',               // Layered layout for hierarchical structures
      'elk.direction': 'DOWN',            // Top to bottom
      'elk.layered.spacing.nodeNodeBetweenLayers': 180,    // Vertical spacing between layers
      'elk.spacing.nodeNode': treeTheme.layout.nodeSeparation + 30,    // Horizontal spacing
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',  // Better node positioning
      'elk.edgeRouting': 'ORTHOGONAL',    // Force orthogonal edge routing
      'elk.layered.edgeRouting.polyline.slopedEdges': false,   // No sloped edges
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',  // Minimize crossings
      'elk.spacing.edgeNode': 15,         // Space between edges and nodes
      'elk.spacing.edgeEdge': 10,         // Space between parallel edges
      'elk.layered.thoroughness': 100,    // Maximum thoroughness for clean layout
      'elk.padding': '[top=50,left=50,bottom=50,right=50]'   // Padding around the graph
    },
    animate: true,
    animationDuration: 500,
    fit: true
  }

  // Dagre layout optimized for orthogonal taxi edges
  const dagreLayout = {
    name: 'dagre',
    rankDir: 'TB',                        // Top to bottom for hierarchical structure
    nodeSep: 120,                         // Increased horizontal spacing for taxi routing
    rankSep: 200,                         // Increased vertical spacing for clean orthogonal lines
    align: 'UL',                          // Align to upper left
    ranker: 'tight-tree',                 // Better tree layout
    marginx: 80,                          // Extra margins for taxi edge routing space
    marginy: 80,
    spacingFactor: 1.5,                   // Looser spacing for better taxi routing
    animate: true,
    animationDuration: 500,
    fit: true,
    padding: 60,                          // Extra padding for taxi edge routing
    edgeSep: 30,                          // Increased edge separation for taxi routing
    acyclicer: 'greedy'
  }

  // Use Dagre with taxi edges for better orthogonal routing
  const layout = dagreLayout

  if (!cytoscapeData) {
    return (
      <Box sx={{ height: '100vh', width: '100%', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading family tree...</Typography>
      </Box>
    )
  }

  // Enhance nodes with relationship information
  const enhancedNodes = enhanceNodeData(
    cytoscapeData.nodes, 
    cytoscapeData.subject, 
    relationships?.relationships || []
  )

  return (
    <Box sx={{ height: '100vh', width: '100%', p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4" component="h1">
          Family Tree Visualization
        </Typography>
        {cytoscapeData.subject && (
          <Chip 
            label={`Subject: ${cytoscapeData.subject.name}`} 
            color="primary" 
            variant="outlined"
          />
        )}
        <Button
          onClick={() => setUseElkLayout(!useElkLayout)}
          variant="outlined"
          color="secondary"
          size="small"
        >
          Edges: Orthogonal (Taxi)
        </Button>
        <Button
          component={Link}
          to="/"
          variant="outlined"
          sx={{ ml: 'auto' }}
        >
          Back to Editor
        </Button>
      </Box>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#ffebee' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Validation Errors:
          </Typography>
          {validationErrors.map((error, index) => (
            <Typography key={index} variant="body2" color="error">
              • {error}
            </Typography>
          ))}
        </Paper>
      )}

      <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 120px)' }}>
        {/* Visualization Panel */}
        <Box sx={{ flex: 2 }}>
          <Paper sx={{ height: '100%', p: 1, bgcolor: treeTheme.colors.background }}>
            <CytoscapeComponent
              elements={[...enhancedNodes, ...cytoscapeData.edges]}
              style={{ width: '100%', height: '100%' }}
              stylesheet={stylesheet}
              layout={layout}
              cy={(cy) => {
                cy.fit()
                cy.center()
                
                // Add some padding around the graph
                cy.fit(cy.elements(), 50)
              }}
            />
          </Paper>
        </Box>

        {/* Relationships Panel */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ height: '100%', overflow: 'auto' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Family Relationships
              </Typography>

              {/* Statistics */}
              {relationships && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Statistics:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip label={`${relationships.statistics.totalRelationships} Total`} size="small" />
                    <Chip label={`${relationships.statistics.generations} Generations`} size="small" />
                    <Chip label={`${relationships.statistics.directLineRelationships} Direct`} size="small" />
                    <Chip label={`${relationships.statistics.cousinRelationships} Cousins`} size="small" />
                  </Box>
                </Box>
              )}

              {/* Legend */}
              <Box sx={{ mb: 2, p: 2, bgcolor: '#EFEFEF', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Color Legend:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 20, 
                      height: 20, 
                      bgcolor: treeTheme.colors.subjectNode, 
                      borderRadius: 1 
                    }} />
                    <Typography variant="caption">Research Subject</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 20, 
                      height: 20, 
                      bgcolor: treeTheme.colors.personNode, 
                      borderRadius: 1 
                    }} />
                    <Typography variant="caption">Family Members</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 20, 
                      height: 20, 
                      bgcolor: treeTheme.colors.spouseNode, 
                      borderRadius: 1 
                    }} />
                    <Typography variant="caption">Spouses</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Relationship List */}
              {relationships && relationships.relationships.length > 0 ? (
                <Box>
                  {/* Group relationships by type */}
                  {['Sibling', 'Parent', 'Child', 'Cousin', 'Aunt', 'Uncle', 'Nephew', 'Niece'].map(relType => {
                    const filteredRels = relationships.relationships.filter(rel => 
                      rel.relationship.includes(relType) || 
                      (relType === 'Parent' && (rel.relationship.includes('father') || rel.relationship.includes('mother'))) ||
                      (relType === 'Child' && (rel.relationship.includes('son') || rel.relationship.includes('daughter')))
                    )
                    
                    if (filteredRels.length === 0) return null

                    return (
                      <Accordion key={relType} sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography variant="subtitle2">
                            {relType}s ({filteredRels.length})
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {filteredRels.map((rel, index) => (
                            <Box key={index} sx={{ mb: 1, p: 1, bgcolor: '#EFEFEF', borderRadius: 1 }}>
                              <Typography variant="body2" fontWeight="bold">
                                {rel.personA} → {rel.personB}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {rel.relationship}
                                {rel.generationDifference > 0 && ` (${rel.generationDifference} gen diff)`}
                              </Typography>
                            </Box>
                          ))}
                        </AccordionDetails>
                      </Accordion>
                    )
                  })}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No relationships calculated yet.
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export default Visualise 