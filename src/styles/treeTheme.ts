// Corporate color palette and styling constants for family tree
export const treeTheme = {
  colors: {
    personNode: '#1C1B1A',      // Dark background for all nodes
    spouseNode: '#1C1B1A',      // Dark background for all nodes
    subjectNode: '#1C1B1A',     // Dark background for all nodes
    background: '#F7F7F7',      // Clean white background
    textLight: '#FFFFFF',       // White text for all dark nodes
    textDark: '#0A0705',        // Black text (not used since all nodes are dark)
    border: '#C6A363',          // Golden border for all nodes
    borderGold: '#C6A363',      // Golden border for all nodes
    edge: '#0A0705'             // Black edges for crisp lines
  },
  
  typography: {
    fontFamily: 'Lato, sans-serif',
    fontWeight: '300',          // Light weight
    nameFontSize: '14px',       // Larger font for names
    detailFontSize: '12px',     // Smaller font for other details
    textAlign: 'center'
  },
  
  layout: {
    nodeWidth: 140,
    nodeHeight: 80,
    nodeSeparation: 80,         // Horizontal spacing
    rankSeparation: 160,        // Vertical spacing
    borderRadius: 8,
    borderWidth: 3              // Increased border width to make golden borders more visible
  },
  
  edges: {
    width: 2,
    color: '#0A0705',           // Black edges for crisp lines
    style: 'solid'
  }
}

// Helper function to determine node color based on relationship to subject
export const getNodeColor = (isSubject: boolean, isSpouse: boolean = false): string => {
  return treeTheme.colors.personNode  // All nodes are dark now
}

// Helper function to determine text color based on node type
export const getTextColor = (isSubject: boolean, isSpouse: boolean = false): string => {
  return treeTheme.colors.textLight  // All nodes have white text on dark background
}

// Helper function to determine border color based on node type
export const getBorderColor = (isSubject: boolean, isSpouse: boolean = false): string => {
  return treeTheme.colors.border  // All nodes have golden borders
}

// Helper function to format date - show only numbers
export const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  } catch {
    return dateString
  }
}

// Helper function to get relationship to subject
export const getRelationshipToSubject = (
  personId: string, 
  subjectId: string, 
  relationships: any[],
  allRows?: any[]
): string => {
  if (personId === subjectId) return '' // Don't show "SUBJECT" mark
  
  // Enhanced direct relationship check using the row data
  if (allRows) {
    const subject = allRows.find((r: any) => r.id.toString() === subjectId)
    const person = allRows.find((r: any) => r.id.toString() === personId)
    
    if (subject && person) {
      console.log(`Checking relationship: ${person.name} (${personId}) to ${subject.name} (${subjectId})`)
      
      // Check if this person is a parent of the subject
      if (subject.parentIds && subject.parentIds.trim() !== '') {
        const subjectParentIds = subject.parentIds.split(',').map((id: string) => id.trim())
        if (subjectParentIds.includes(personId)) {
          const result = person.sex === 'M' ? 'Father' : person.sex === 'F' ? 'Mother' : 'Parent'
          console.log(`Found parent relationship: ${result}`)
          return result
        }
      }
      
      // Check if this person is a child of the subject
      if (person.parentIds && person.parentIds.trim() !== '') {
        const personParentIds = person.parentIds.split(',').map((id: string) => id.trim())
        if (personParentIds.includes(subjectId)) {
          const result = person.sex === 'M' ? 'Son' : person.sex === 'F' ? 'Daughter' : 'Child'
          console.log(`Found child relationship: ${result}`)
          return result
        }
      }
      
      // Check if they are spouses (check both directions)
      if (subject.spouseIds && subject.spouseIds.trim() !== '') {
        const subjectSpouseIds = subject.spouseIds.split(',').map((id: string) => id.trim())
        if (subjectSpouseIds.includes(personId)) {
          const result = person.sex === 'M' ? 'Husband' : person.sex === 'F' ? 'Wife' : 'Spouse'
          console.log(`Found spouse relationship: ${result}`)
          return result
        }
      }
      
      if (person.spouseIds && person.spouseIds.trim() !== '') {
        const personSpouseIds = person.spouseIds.split(',').map((id: string) => id.trim())
        if (personSpouseIds.includes(subjectId)) {
          const result = person.sex === 'M' ? 'Husband' : person.sex === 'F' ? 'Wife' : 'Spouse'
          console.log(`Found spouse relationship (reverse): ${result}`)
          return result
        }
      }
      
      // Check if they share the same parents (siblings)
      if (subject.parentIds && person.parentIds && 
          subject.parentIds.trim() !== '' && person.parentIds.trim() !== '') {
        const subjectParents = subject.parentIds.split(',').map((id: string) => id.trim()).sort()
        const personParents = person.parentIds.split(',').map((id: string) => id.trim()).sort()
        
        if (JSON.stringify(subjectParents) === JSON.stringify(personParents)) {
          const result = person.sex === 'M' ? 'Brother' : person.sex === 'F' ? 'Sister' : 'Sibling'
          console.log(`Found sibling relationship: ${result}`)
          return result
        }
      }
      
      // Check for grandparent relationships
      if (subject.parentIds && subject.parentIds.trim() !== '') {
        const subjectParentIds = subject.parentIds.split(',').map((id: string) => id.trim())
        for (const parentId of subjectParentIds) {
          const parent = allRows.find((r: any) => r.id.toString() === parentId)
          if (parent && parent.parentIds && parent.parentIds.trim() !== '') {
            const grandparentIds = parent.parentIds.split(',').map((id: string) => id.trim())
            if (grandparentIds.includes(personId)) {
              const result = person.sex === 'M' ? 'Grandfather' : person.sex === 'F' ? 'Grandmother' : 'Grandparent'
              console.log(`Found grandparent relationship: ${result}`)
              return result
            }
          }
        }
      }
      
      // Check for grandchild relationships
      if (person.parentIds && person.parentIds.trim() !== '') {
        const personParentIds = person.parentIds.split(',').map((id: string) => id.trim())
        for (const parentId of personParentIds) {
          const parent = allRows.find((r: any) => r.id.toString() === parentId)
          if (parent && parent.parentIds && parent.parentIds.trim() !== '') {
            const grandparentIds = parent.parentIds.split(',').map((id: string) => id.trim())
            if (grandparentIds.includes(subjectId)) {
              const result = person.sex === 'M' ? 'Grandson' : person.sex === 'F' ? 'Granddaughter' : 'Grandchild'
              console.log(`Found grandchild relationship: ${result}`)
              return result
            }
          }
        }
      }
      
      console.log(`No direct relationship found, falling back to complex calculation`)
    }
  }
  
  // Fallback to the complex relationship calculation
  const relationship = relationships.find(rel => 
    (rel.personA === personId && rel.personB === subjectId) ||
    (rel.personA === subjectId && rel.personB === personId)
  )
  
  if (relationship) {
    console.log(`Found complex relationship: ${relationship.relationship}`)
    // If the relationship is from subject to person, we need to reverse it
    if (relationship.personA === subjectId) {
      // Subject is personA, so we need the reverse relationship
      return reverseRelationship(relationship.relationship)
    } else {
      // Person is personA, relationship is correct
      return relationship.relationship
    }
  }
  
  console.log(`No relationship found, returning 'Family member'`)
  return 'Family member'
}

// Helper function to reverse relationships when needed
const reverseRelationship = (relationship: string): string => {
  const reversals: { [key: string]: string } = {
    'father': 'son',
    'mother': 'daughter', 
    'son': 'father',
    'daughter': 'mother',
    'grandfather': 'grandson',
    'grandmother': 'granddaughter',
    'grandson': 'grandfather',
    'granddaughter': 'grandmother',
    'uncle': 'nephew',
    'aunt': 'niece',
    'nephew': 'uncle',
    'niece': 'aunt',
    'brother': 'brother',
    'sister': 'sister',
    'husband': 'wife',
    'wife': 'husband'
  }
  
  // Handle compound relationships like "Great grandfather"
  const lowerRel = relationship.toLowerCase()
  
  // Check for exact matches first
  for (const [key, value] of Object.entries(reversals)) {
    if (lowerRel.includes(key)) {
      const prefix = lowerRel.replace(key, '').trim()
      return prefix ? `${prefix} ${value}` : value
    }
  }
  
  // Handle cousin relationships (they're symmetric)
  if (lowerRel.includes('cousin')) {
    return relationship
  }
  
  // Default case
  return relationship
} 