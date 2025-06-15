// Corporate color palette and styling constants for family tree
export const treeTheme = {
  colors: {
    personNode: '#0066cc',      // Blue for regular people
    spouseNode: '#ff5599',      // Pink for spouses
    subjectNode: '#004499',     // Darker blue for subject
    background: 'transparent',  // Transparent background
    text: '#ffffff',            // White text
    border: '#003366',          // Dark blue border
    edge: '#666666'             // Gray edges
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
    borderWidth: 2
  },
  
  edges: {
    width: 2,
    color: '#666666',
    style: 'solid'
  }
}

// Helper function to determine node color based on relationship to subject
export const getNodeColor = (isSubject: boolean, isSpouse: boolean = false): string => {
  if (isSubject) return treeTheme.colors.subjectNode
  if (isSpouse) return treeTheme.colors.spouseNode
  return treeTheme.colors.personNode
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
  relationships: any[]
): string => {
  if (personId === subjectId) return '' // Don't show "SUBJECT" mark
  
  const relationship = relationships.find(rel => 
    (rel.personA === personId && rel.personB === subjectId) ||
    (rel.personA === subjectId && rel.personB === personId)
  )
  
  if (relationship) {
    // If the relationship is from subject to person, we need to reverse it
    if (relationship.personA === subjectId) {
      // Subject is personA, so we need the reverse relationship
      return reverseRelationship(relationship.relationship)
    } else {
      // Person is personA, relationship is correct
      return relationship.relationship
    }
  }
  
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