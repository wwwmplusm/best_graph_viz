const initialElements = [
  // Original family - Parents
  {
    data: {
      id: 'john',
      label: 'John',
      type: 'person'
    },
    position: { x: 100, y: 100 }
  },
  {
    data: {
      id: 'mary',
      label: 'Mary',
      type: 'person'
    },
    position: { x: 300, y: 100 }
  },
  
  // Tom and his siblings
  {
    data: {
      id: 'tom',
      label: 'Tom',
      type: 'person'
    },
    position: { x: 200, y: 300 }
  },
  {
    data: {
      id: 'mike',
      label: 'Mike',
      type: 'person'
    },
    position: { x: 50, y: 300 }
  },
  {
    data: {
      id: 'david',
      label: 'David',
      type: 'person'
    },
    position: { x: 350, y: 300 }
  },
  {
    data: {
      id: 'sarah',
      label: 'Sarah',
      type: 'person'
    },
    position: { x: 500, y: 300 }
  },

  // Tom's spouses
  {
    data: {
      id: 'anna',
      label: 'Anna',
      type: 'person'
    },
    position: { x: 100, y: 450 }
  },
  {
    data: {
      id: 'lisa',
      label: 'Lisa',
      type: 'person'
    },
    position: { x: 200, y: 450 }
  },
  {
    data: {
      id: 'emma',
      label: 'Emma',
      type: 'person'
    },
    position: { x: 300, y: 450 }
  },

  // Children from Tom and Anna
  {
    data: {
      id: 'alex',
      label: 'Alex',
      type: 'person'
    },
    position: { x: 50, y: 600 }
  },
  {
    data: {
      id: 'ben',
      label: 'Ben',
      type: 'person'
    },
    position: { x: 100, y: 600 }
  },
  {
    data: {
      id: 'chloe',
      label: 'Chloe',
      type: 'person'
    },
    position: { x: 150, y: 600 }
  },

  // Children from Tom and Lisa
  {
    data: {
      id: 'daniel',
      label: 'Daniel',
      type: 'person'
    },
    position: { x: 200, y: 600 }
  },
  {
    data: {
      id: 'eva',
      label: 'Eva',
      type: 'person'
    },
    position: { x: 250, y: 600 }
  },
  {
    data: {
      id: 'frank',
      label: 'Frank',
      type: 'person'
    },
    position: { x: 300, y: 600 }
  },

  // Children from Tom and Emma
  {
    data: {
      id: 'grace',
      label: 'Grace',
      type: 'person'
    },
    position: { x: 350, y: 600 }
  },
  {
    data: {
      id: 'henry',
      label: 'Henry',
      type: 'person'
    },
    position: { x: 400, y: 600 }
  },
  {
    data: {
      id: 'ivy',
      label: 'Ivy',
      type: 'person'
    },
    position: { x: 450, y: 600 }
  },

  // Parent-child relationships (original)
  {
    data: {
      id: 'j-t',
      source: 'john',
      target: 'tom',
      label: 'father'
    }
  },
  {
    data: {
      id: 'm-t',
      source: 'mary',
      target: 'tom',
      label: 'mother'
    }
  },

  // Parent-sibling relationships
  {
    data: {
      id: 'j-mike',
      source: 'john',
      target: 'mike',
      label: 'father'
    }
  },
  {
    data: {
      id: 'm-mike',
      source: 'mary',
      target: 'mike',
      label: 'mother'
    }
  },
  {
    data: {
      id: 'j-david',
      source: 'john',
      target: 'david',
      label: 'father'
    }
  },
  {
    data: {
      id: 'm-david',
      source: 'mary',
      target: 'david',
      label: 'mother'
    }
  },
  {
    data: {
      id: 'j-sarah',
      source: 'john',
      target: 'sarah',
      label: 'father'
    }
  },
  {
    data: {
      id: 'm-sarah',
      source: 'mary',
      target: 'sarah',
      label: 'mother'
    }
  },

  // Marriage relationships
  {
    data: {
      id: 't-anna',
      source: 'tom',
      target: 'anna',
      label: 'married'
    }
  },
  {
    data: {
      id: 't-lisa',
      source: 'tom',
      target: 'lisa',
      label: 'married'
    }
  },
  {
    data: {
      id: 't-emma',
      source: 'tom',
      target: 'emma',
      label: 'married'
    }
  },

  // Tom's children from Anna
  {
    data: {
      id: 't-alex',
      source: 'tom',
      target: 'alex',
      label: 'father'
    }
  },
  {
    data: {
      id: 'anna-alex',
      source: 'anna',
      target: 'alex',
      label: 'mother'
    }
  },
  {
    data: {
      id: 't-ben',
      source: 'tom',
      target: 'ben',
      label: 'father'
    }
  },
  {
    data: {
      id: 'anna-ben',
      source: 'anna',
      target: 'ben',
      label: 'mother'
    }
  },
  {
    data: {
      id: 't-chloe',
      source: 'tom',
      target: 'chloe',
      label: 'father'
    }
  },
  {
    data: {
      id: 'anna-chloe',
      source: 'anna',
      target: 'chloe',
      label: 'mother'
    }
  },

  // Tom's children from Lisa
  {
    data: {
      id: 't-daniel',
      source: 'tom',
      target: 'daniel',
      label: 'father'
    }
  },
  {
    data: {
      id: 'lisa-daniel',
      source: 'lisa',
      target: 'daniel',
      label: 'mother'
    }
  },
  {
    data: {
      id: 't-eva',
      source: 'tom',
      target: 'eva',
      label: 'father'
    }
  },
  {
    data: {
      id: 'lisa-eva',
      source: 'lisa',
      target: 'eva',
      label: 'mother'
    }
  },
  {
    data: {
      id: 't-frank',
      source: 'tom',
      target: 'frank',
      label: 'father'
    }
  },
  {
    data: {
      id: 'lisa-frank',
      source: 'lisa',
      target: 'frank',
      label: 'mother'
    }
  },

  // Tom's children from Emma
  {
    data: {
      id: 't-grace',
      source: 'tom',
      target: 'grace',
      label: 'father'
    }
  },
  {
    data: {
      id: 'emma-grace',
      source: 'emma',
      target: 'grace',
      label: 'mother'
    }
  },
  {
    data: {
      id: 't-henry',
      source: 'tom',
      target: 'henry',
      label: 'father'
    }
  },
  {
    data: {
      id: 'emma-henry',
      source: 'emma',
      target: 'henry',
      label: 'mother'
    }
  },
  {
    data: {
      id: 't-ivy',
      source: 'tom',
      target: 'ivy',
      label: 'father'
    }
  },
  {
    data: {
      id: 'emma-ivy',
      source: 'emma',
      target: 'ivy',
      label: 'mother'
    }
  }
];

export default initialElements; 