const initialElements = [
  // Original family - Parents
  {
    data: {
      id: 'john',
      label: 'John',
      type: 'person',
      dob: '1965-03-12'
    }
  },
  {
    data: {
      id: 'mary',
      label: 'Mary',
      type: 'person',
      dob: '1967-08-22'
    }
  },
  
  // Tom and his siblings
  {
    data: {
      id: 'tom',
      label: 'Tom',
      type: 'person',
      dob: '1992-05-15'
    }
  },
  {
    data: {
      id: 'mike',
      label: 'Mike',
      type: 'person',
      dob: '1988-11-03'
    }
  },
  {
    data: {
      id: 'david',
      label: 'David',
      type: 'person',
      dob: '1990-07-28'
    }
  },
  {
    data: {
      id: 'sarah',
      label: 'Sarah',
      type: 'person',
      dob: '1994-12-10'
    }
  },

  // Tom's spouses
  {
    data: {
      id: 'anna',
      label: 'Anna',
      type: 'person',
      dob: '1993-01-20'
    }
  },
  {
    data: {
      id: 'lisa',
      label: 'Lisa',
      type: 'person',
      dob: '1991-09-14'
    }
  },
  {
    data: {
      id: 'emma',
      label: 'Emma',
      type: 'person',
      dob: '1995-04-07'
    }
  },

  // Children from Tom and Anna
  {
    data: {
      id: 'alex',
      label: 'Alex',
      type: 'person',
      dob: '2015-06-18'
    }
  },
  {
    data: {
      id: 'ben',
      label: 'Ben',
      type: 'person',
      dob: '2017-02-25'
    }
  },
  {
    data: {
      id: 'chloe',
      label: 'Chloe',
      type: 'person',
      dob: '2019-10-12'
    }
  },

  // Children from Tom and Lisa
  {
    data: {
      id: 'daniel',
      label: 'Daniel',
      type: 'person',
      dob: '2016-03-30'
    }
  },
  {
    data: {
      id: 'eva',
      label: 'Eva',
      type: 'person',
      dob: '2018-08-14'
    }
  },
  {
    data: {
      id: 'frank',
      label: 'Frank',
      type: 'person',
      dob: '2020-11-05'
    }
  },

  // Children from Tom and Emma
  {
    data: {
      id: 'grace',
      label: 'Grace',
      type: 'person',
      dob: '2017-12-08'
    }
  },
  {
    data: {
      id: 'henry',
      label: 'Henry',
      type: 'person',
      dob: '2019-05-22'
    }
  },
  {
    data: {
      id: 'ivy',
      label: 'Ivy',
      type: 'person',
      dob: '2021-09-16'
    }
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