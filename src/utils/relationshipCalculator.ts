import { PersonRow } from '../store/useFamilyStore'

export interface RelationshipResult {
  personA: string
  personB: string
  relationship: string
  degree?: number
  generationDifference: number
  commonAncestor?: string
  isDirectLine: boolean
}

export interface FamilyRelationships {
  relationships: RelationshipResult[]
  statistics: {
    totalRelationships: number
    directLineRelationships: number
    cousinRelationships: number
    inLawRelationships: number
    generations: number
  }
}

export class RelationshipCalculator {
  private people: Map<string, PersonRow> = new Map()
  private parentMap: Map<string, string[]> = new Map()
  private childrenMap: Map<string, string[]> = new Map()
  private generationMap: Map<string, number> = new Map()

  // Relationship terminology arrays
  private readonly cousinPrefixes = ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth']
  private readonly cousinSuffixes = ['', 'Once', 'Twice', 'Thrice', '4 times', '5 times', '6 times', '7 times', '8 times', '9 times']

  constructor(rows: PersonRow[]) {
    this.buildFamilyMaps(rows)
    this.calculateGenerations()
  }

  /**
   * Build internal maps for efficient relationship calculations
   */
  private buildFamilyMaps(rows: PersonRow[]): void {
    // Build people map
    rows.forEach(person => {
      if (person.name.trim()) {
        this.people.set(person.id.toString(), person)
      }
    })

    // Build parent and children maps
    this.people.forEach(person => {
      const personId = person.id.toString()
      
      // Initialize children map
      this.childrenMap.set(personId, [])
      
      // Process parents
      if (person.parentIds && person.parentIds.trim()) {
        const parentIds = person.parentIds.split(',').map(id => id.trim()).filter(id => id)
        this.parentMap.set(personId, parentIds)
        
        // Add this person as child to each parent
        parentIds.forEach(parentId => {
          if (!this.childrenMap.has(parentId)) {
            this.childrenMap.set(parentId, [])
          }
          this.childrenMap.get(parentId)!.push(personId)
        })
      } else {
        this.parentMap.set(personId, [])
      }
    })
  }

  /**
   * Calculate generation levels for all people
   */
  private calculateGenerations(): void {
    // Find root ancestors (people with no parents)
    const rootAncestors = Array.from(this.people.keys()).filter(id => 
      !this.parentMap.get(id)?.length
    )

    // Set root generation to 1 (following the lineage algorithm convention)
    rootAncestors.forEach(rootId => {
      this.generationMap.set(rootId, 1)
    })

    // Recursively calculate generations
    const calculateChildGenerations = (parentId: string, parentGeneration: number) => {
      const children = this.childrenMap.get(parentId) || []
      children.forEach(childId => {
        const currentGeneration = this.generationMap.get(childId)
        const newGeneration = parentGeneration + 1
        
        // Set generation if not set, or use the minimum generation (closest to root)
        if (!currentGeneration || newGeneration < currentGeneration) {
          this.generationMap.set(childId, newGeneration)
          calculateChildGenerations(childId, newGeneration)
        }
      })
    }

    rootAncestors.forEach(rootId => {
      calculateChildGenerations(rootId, 1)
    })

    // Handle orphaned nodes
    this.people.forEach((_, personId) => {
      if (!this.generationMap.has(personId)) {
        this.generationMap.set(personId, 1)
      }
    })
  }

  /**
   * Get generation of a person
   */
  private getGeneration(personId: string): number {
    return this.generationMap.get(personId) || 1
  }

  /**
   * Get generation difference between two people
   */
  private getGenerationDifference(personA: string, personB: string): number {
    return Math.abs(this.getGeneration(personA) - this.getGeneration(personB))
  }

  /**
   * Find the lowest common ancestor of two people
   */
  private findCommonAncestor(personA: string, personB: string): string | null {
    if (personA === personB) return null

    const ancestorsA = this.getAncestors(personA)
    const ancestorsB = this.getAncestors(personB)

    // Find the lowest common ancestor (highest generation number)
    let commonAncestor: string | null = null
    let highestGeneration = 0

    ancestorsA.forEach(ancestorA => {
      if (ancestorsB.includes(ancestorA)) {
        const generation = this.getGeneration(ancestorA)
        if (generation > highestGeneration) {
          highestGeneration = generation
          commonAncestor = ancestorA
        }
      }
    })

    return commonAncestor
  }

  /**
   * Get all ancestors of a person
   */
  private getAncestors(personId: string): string[] {
    const ancestors: string[] = []
    const visited = new Set<string>()
    
    const collectAncestors = (id: string) => {
      if (visited.has(id)) return
      visited.add(id)
      
      const parents = this.parentMap.get(id) || []
      parents.forEach(parentId => {
        if (this.people.has(parentId)) {
          ancestors.push(parentId)
          collectAncestors(parentId)
        }
      })
    }

    collectAncestors(personId)
    return ancestors
  }

  /**
   * Check if personA is a direct ancestor of personB
   */
  private isDirectAncestor(ancestorId: string, descendantId: string): boolean {
    const ancestors = this.getAncestors(descendantId)
    return ancestors.includes(ancestorId)
  }

  /**
   * Get ancestor from specific generation
   */
  private getAncestorFromGeneration(personId: string, targetGeneration: number): string | null {
    if (this.getGeneration(personId) <= targetGeneration) {
      return personId
    }

    const parents = this.parentMap.get(personId) || []
    for (const parentId of parents) {
      const ancestor = this.getAncestorFromGeneration(parentId, targetGeneration)
      if (ancestor) return ancestor
    }

    return null
  }

  /**
   * Generate generation prefix (great, grand, etc.)
   */
  private getGenerationPrefix(generationDiff: number): string {
    if (generationDiff === 1) return ''
    if (generationDiff === 2) return 'Grand'
    
    let prefix = 'Grand'
    for (let i = 1; i <= generationDiff - 2; i++) {
      prefix = 'Great ' + prefix
    }
    return prefix
  }

  /**
   * Determine relationship between two people
   */
  private calculateRelationship(personA: string, personB: string): RelationshipResult {
    const personAData = this.people.get(personA)!
    const personBData = this.people.get(personB)!
    
    const generationDiff = this.getGenerationDifference(personA, personB)
    const commonAncestor = this.findCommonAncestor(personA, personB)
    
    // Check for siblings (same parents)
    const parentsA = this.parentMap.get(personA) || []
    const parentsB = this.parentMap.get(personB) || []
    const sharedParents = parentsA.filter(parent => parentsB.includes(parent))
    
    if (sharedParents.length > 0) {
      return {
        personA: personAData.name,
        personB: personBData.name,
        relationship: 'Sibling',
        generationDifference: 0,
        commonAncestor: sharedParents[0],
        isDirectLine: false
      }
    }

    // Check for direct ancestor/descendant relationship
    if (this.isDirectAncestor(personA, personB)) {
      const prefix = this.getGenerationPrefix(generationDiff)
      const relationship = prefix ? `${prefix}parent` : 'Parent'
      return {
        personA: personAData.name,
        personB: personBData.name,
        relationship: this.getGenderedRelationship(relationship, personAData.sex, true),
        generationDifference: generationDiff,
        isDirectLine: true
      }
    }

    if (this.isDirectAncestor(personB, personA)) {
      const prefix = this.getGenerationPrefix(generationDiff)
      const relationship = prefix ? `${prefix}child` : 'Child'
      return {
        personA: personAData.name,
        personB: personBData.name,
        relationship: this.getGenderedRelationship(relationship, personAData.sex, false),
        generationDifference: generationDiff,
        isDirectLine: true
      }
    }

    // Check for aunt/uncle or nephew/niece relationships
    if (commonAncestor) {
      const ancestorGenA = this.getAncestorFromGeneration(personA, this.getGeneration(personB))
      const ancestorGenB = this.getAncestorFromGeneration(personB, this.getGeneration(personA))
      
      // Check if one is aunt/uncle of the other
      if (ancestorGenA && this.parentMap.get(ancestorGenA)?.some(parent => 
          this.parentMap.get(personB)?.includes(parent))) {
        const prefix = this.getGenerationPrefix(generationDiff)
        const relationship = prefix ? `${prefix}aunt/uncle` : 'Aunt/Uncle'
        return {
          personA: personAData.name,
          personB: personBData.name,
          relationship: this.getGenderedRelationship(relationship, personAData.sex, true),
          generationDifference: generationDiff,
          commonAncestor,
          isDirectLine: false
        }
      }

      if (ancestorGenB && this.parentMap.get(ancestorGenB)?.some(parent => 
          this.parentMap.get(personA)?.includes(parent))) {
        const prefix = this.getGenerationPrefix(generationDiff)
        const relationship = prefix ? `${prefix}nephew/niece` : 'Nephew/Niece'
        return {
          personA: personAData.name,
          personB: personBData.name,
          relationship: this.getGenderedRelationship(relationship, personAData.sex, false),
          generationDifference: generationDiff,
          commonAncestor,
          isDirectLine: false
        }
      }

      // Calculate cousin relationship
      const genA = this.getGeneration(personA)
      const genB = this.getGeneration(personB)
      const genCommon = this.getGeneration(commonAncestor)
      
      const degreeA = genA - genCommon - 1
      const degreeB = genB - genCommon - 1
      
      if (degreeA >= 1 && degreeB >= 1) {
        const degree = Math.min(degreeA, degreeB)
        const removed = Math.abs(degreeA - degreeB)
        
        let relationship = `${this.cousinPrefixes[degree]} Cousin`
        if (removed > 0) {
          relationship += ` ${this.cousinSuffixes[removed]} Removed`
        }
        
        return {
          personA: personAData.name,
          personB: personBData.name,
          relationship,
          degree,
          generationDifference: generationDiff,
                     commonAncestor,
           isDirectLine: false
         }
       }
     }

     // Default relationship
     return {
       personA: personAData.name,
       personB: personBData.name,
       relationship: 'Distant Relative',
       generationDifference: generationDiff,
       commonAncestor: commonAncestor || undefined,
       isDirectLine: false
     }
  }

  /**
   * Apply gender-specific relationship terms
   */
  private getGenderedRelationship(relationship: string, sex: string, isOlder: boolean): string {
    const gender = sex.toLowerCase()
    
    if (relationship.includes('parent')) {
      return relationship.replace('parent', gender === 'm' ? 'father' : gender === 'f' ? 'mother' : 'parent')
    }
    
    if (relationship.includes('child')) {
      return relationship.replace('child', gender === 'm' ? 'son' : gender === 'f' ? 'daughter' : 'child')
    }
    
    if (relationship.includes('aunt/uncle')) {
      return relationship.replace('aunt/uncle', gender === 'm' ? 'uncle' : gender === 'f' ? 'aunt' : 'aunt/uncle')
    }
    
    if (relationship.includes('nephew/niece')) {
      return relationship.replace('nephew/niece', gender === 'm' ? 'nephew' : gender === 'f' ? 'niece' : 'nephew/niece')
    }
    
    return relationship
  }

  /**
   * Calculate all relationships in the family tree
   */
  public calculateAllRelationships(): FamilyRelationships {
    const relationships: RelationshipResult[] = []
    const peopleIds = Array.from(this.people.keys())
    
    // Calculate relationships between all pairs
    for (let i = 0; i < peopleIds.length; i++) {
      for (let j = i + 1; j < peopleIds.length; j++) {
        const relationship = this.calculateRelationship(peopleIds[i], peopleIds[j])
        relationships.push(relationship)
      }
    }

    // Calculate statistics
    const directLineRelationships = relationships.filter(r => r.isDirectLine).length
    const cousinRelationships = relationships.filter(r => r.relationship.includes('Cousin')).length
    const inLawRelationships = relationships.filter(r => r.relationship.includes('In-Law')).length
    const maxGeneration = Math.max(...Array.from(this.generationMap.values()))

    return {
      relationships,
      statistics: {
        totalRelationships: relationships.length,
        directLineRelationships,
        cousinRelationships,
        inLawRelationships,
        generations: maxGeneration
      }
    }
  }
}

/**
 * Main function to calculate family relationships from table data
 */
export const calculateFamilyRelationships = (rows: PersonRow[]): FamilyRelationships => {
  const calculator = new RelationshipCalculator(rows)
  return calculator.calculateAllRelationships()
} 