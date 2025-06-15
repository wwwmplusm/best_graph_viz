import { PersonRow } from '../store/useFamilyStore'
import { calculateFamilyRelationships, FamilyRelationships } from './relationshipCalculator'

export interface CytoscapeNode {
  data: {
    id: string
    label: string
    type: 'person'
    sex?: string
    dob?: string
    comment?: string
    generation?: number
    isSubject?: boolean
  }
  position?: { x: number; y: number }
}

export interface CytoscapeEdge {
  data: {
    id: string
    source: string
    target: string
    label: string
    type: 'parent' | 'spouse'
  }
}

export interface CytoscapeElements {
  nodes: CytoscapeNode[]
  edges: CytoscapeEdge[]
  relationships?: FamilyRelationships
  subject?: PersonRow
}

export class FamilyTreeParser {
  private rows: PersonRow[]
  private generationMap: Map<string, number> = new Map()
  private processedSpouses: Set<string> = new Set()
  private subject: PersonRow | null = null

  constructor(rows: PersonRow[]) {
    this.rows = rows.filter(row => row.name.trim() !== '') // Filter out empty rows
    this.subject = this.rows.find(row => row.ifSubject === 1) || null
  }

  /**
   * Main method to parse table data and return Cytoscape elements
   */
  public parse(): CytoscapeElements {
    this.calculateGenerations()
    const nodes = this.createNodes()
    const edges = this.createEdges()
    
    // Calculate all family relationships
    const relationships = calculateFamilyRelationships(this.rows)
    
    return {
      nodes: this.positionNodes(nodes),
      edges,
      relationships,
      subject: this.subject || undefined
    }
  }

  /**
   * Calculate generation levels for proper positioning
   */
  private calculateGenerations(): void {
    // Find root nodes (people with no parents)
    const rootNodes = this.rows.filter(row => !row.parentIds || row.parentIds.trim() === '')
    
    // Set root generation to 0
    rootNodes.forEach(root => {
      this.generationMap.set(root.id.toString(), 0)
    })

    // Recursively calculate generations for children
    const calculateChildGenerations = (parentId: string, generation: number) => {
      const children = this.rows.filter(row => {
        if (!row.parentIds || row.parentIds.trim() === '') return false
        const parentIds = row.parentIds.split(',').map(id => id.trim())
        return parentIds.includes(parentId)
      })
      
      children.forEach(child => {
        const childId = child.id.toString()
        if (!this.generationMap.has(childId)) {
          this.generationMap.set(childId, generation + 1)
          calculateChildGenerations(childId, generation + 1)
        }
      })
    }

    rootNodes.forEach(root => {
      calculateChildGenerations(root.id.toString(), 0)
    })

    // Handle orphaned nodes (nodes that don't have a clear generation path)
    this.rows.forEach(row => {
      const id = row.id.toString()
      if (!this.generationMap.has(id)) {
        this.generationMap.set(id, 0) // Default to generation 0
      }
    })
  }

  /**
   * Create Cytoscape nodes from table data
   */
  private createNodes(): CytoscapeNode[] {
    return this.rows.map(row => ({
      data: {
        id: row.id.toString(),
        label: row.name,
        type: 'person' as const,
        sex: row.sex,
        dob: row.dob,
        comment: row.comment,
        generation: this.generationMap.get(row.id.toString()) || 0,
        isSubject: row.ifSubject === 1
      }
    }))
  }

  /**
   * Create Cytoscape edges for parent-child and spouse relationships
   */
  private createEdges(): CytoscapeEdge[] {
    const edges: CytoscapeEdge[] = []

    this.rows.forEach(row => {
      const childId = row.id.toString()

      // Create parent-child relationships
      if (row.parentIds && row.parentIds.trim() !== '') {
        const parentIds = row.parentIds.split(',').map(id => id.trim()).filter(id => id !== '')
        
        parentIds.forEach(parentId => {
          const parent = this.rows.find(r => r.id.toString() === parentId)
          if (parent) {
            edges.push({
              data: {
                id: `parent-${parentId}-${childId}`,
                source: parentId,
                target: childId,
                label: '',
                type: 'parent'
              }
            })
          }
        })
      }

      // Create spouse relationships (avoid duplicates)
      if (row.spouseIds && row.spouseIds.trim() !== '') {
        const spouseIds = row.spouseIds.split(',').map(id => id.trim()).filter(id => id !== '')
        
        spouseIds.forEach(spouseId => {
          const spouse = this.rows.find(r => r.id.toString() === spouseId)
          if (spouse) {
            const relationshipKey = [row.id.toString(), spouseId].sort().join('-')
            
            if (!this.processedSpouses.has(relationshipKey)) {
              this.processedSpouses.add(relationshipKey)
              
              edges.push({
                data: {
                  id: `spouse-${relationshipKey}`,
                  source: row.id.toString(),
                  target: spouseId,
                  label: '',
                  type: 'spouse'
                }
              })
            }
          }
        })
      }
    })

    return edges
  }

  /**
   * Get appropriate parent label based on sex
   */
  private getParentLabel(sex: string): string {
    switch (sex.toLowerCase()) {
      case 'm':
      case 'male':
        return 'father'
      case 'f':
      case 'female':
        return 'mother'
      default:
        return 'parent'
    }
  }

  /**
   * Position nodes in a hierarchical layout
   */
  private positionNodes(nodes: CytoscapeNode[]): CytoscapeNode[] {
    const generationGroups: Map<number, CytoscapeNode[]> = new Map()
    
    // Group nodes by generation
    nodes.forEach(node => {
      const generation = node.data.generation || 0
      if (!generationGroups.has(generation)) {
        generationGroups.set(generation, [])
      }
      generationGroups.get(generation)!.push(node)
    })

    // Position nodes
    const verticalSpacing = 200
    const horizontalSpacing = 150
    const startY = 100

    generationGroups.forEach((generationNodes, generation) => {
      const y = startY + (generation * verticalSpacing)
      const totalWidth = (generationNodes.length - 1) * horizontalSpacing
      const startX = Math.max(100, (800 - totalWidth) / 2) // Center horizontally

      generationNodes.forEach((node, index) => {
        node.position = {
          x: startX + (index * horizontalSpacing),
          y: y
        }
      })
    })

    return nodes
  }

  /**
   * Validate the table data for common issues
   */
  public validate(): string[] {
    const errors: string[] = []
    const ids = new Set<string>()

    // Check subject validation first
    const subjects = this.rows.filter(row => row.ifSubject === 1)
    if (subjects.length === 0) {
      errors.push('No research subject selected. Please mark exactly one person as the subject.')
    } else if (subjects.length > 1) {
      errors.push(`Multiple subjects detected (${subjects.map(s => s.name).join(', ')}). Only one person should be marked as subject.`)
    }

    this.rows.forEach(row => {
      const id = row.id.toString()

      // Check for duplicate IDs
      if (ids.has(id)) {
        errors.push(`Duplicate ID found: ${id}`)
      }
      ids.add(id)

      // Check for self-referencing parent
      if (row.parentIds && row.parentIds.includes(id)) {
        const parentIds = row.parentIds.split(',').map(id => id.trim())
        if (parentIds.includes(id)) {
          errors.push(`Person ${row.name} (ID: ${id}) cannot be their own parent`)
        }
      }

      // Check for self-referencing spouse
      if (row.spouseIds && row.spouseIds.includes(id)) {
        const spouseIds = row.spouseIds.split(',').map(id => id.trim())
        if (spouseIds.includes(id)) {
          errors.push(`Person ${row.name} (ID: ${id}) cannot be their own spouse`)
        }
      }

      // Check if referenced parents exist
      if (row.parentIds && row.parentIds.trim() !== '') {
        const parentIds = row.parentIds.split(',').map(id => id.trim()).filter(id => id !== '')
        parentIds.forEach(parentId => {
          if (!this.rows.find(r => r.id.toString() === parentId)) {
            errors.push(`Parent ID ${parentId} referenced by ${row.name} does not exist`)
          }
        })
      }

      // Check if referenced spouses exist
      if (row.spouseIds && row.spouseIds.trim() !== '') {
        const spouseIds = row.spouseIds.split(',').map(id => id.trim()).filter(id => id !== '')
        spouseIds.forEach(spouseId => {
          if (!this.rows.find(r => r.id.toString() === spouseId)) {
            errors.push(`Spouse ID ${spouseId} referenced by ${row.name} does not exist`)
          }
        })
      }
    })

    return errors
  }

  /**
   * Get statistics about the family tree
   */
  public getStatistics(): {
    totalPeople: number
    generations: number
    marriages: number
    orphans: number
    childrenCount: number
    subject?: string
  } {
    const totalPeople = this.rows.length
    const generations = Math.max(...Array.from(this.generationMap.values())) + 1
    
    const marriages = new Set<string>()
    let childrenCount = 0
    let orphans = 0

    this.rows.forEach(row => {
      // Count children (people with parents)
      if (row.parentIds && row.parentIds.trim() !== '') {
        childrenCount++
      } else {
        orphans++
      }

      // Count unique marriages
      if (row.spouseIds && row.spouseIds.trim() !== '') {
        const spouseIds = row.spouseIds.split(',').map(id => id.trim()).filter(id => id !== '')
        spouseIds.forEach(spouseId => {
          const relationshipKey = [row.id.toString(), spouseId].sort().join('-')
          marriages.add(relationshipKey)
        })
      }
    })

    return {
      totalPeople,
      generations,
      marriages: marriages.size,
      orphans,
      childrenCount,
      subject: this.subject?.name
    }
  }
}

/**
 * Utility function to parse family tree data
 */
export const parseFamilyTree = (rows: PersonRow[]): CytoscapeElements => {
  const parser = new FamilyTreeParser(rows)
  return parser.parse()
}

/**
 * Utility function to validate family tree data
 */
export const validateFamilyTree = (rows: PersonRow[]): string[] => {
  const parser = new FamilyTreeParser(rows)
  return parser.validate()
}

/**
 * Utility function to get family tree statistics
 */
export const getFamilyTreeStatistics = (rows: PersonRow[]) => {
  const parser = new FamilyTreeParser(rows)
  return parser.getStatistics()
} 