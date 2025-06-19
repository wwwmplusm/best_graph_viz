import React, { useState, useEffect, useRef } from 'react';
import cytoscape from '../cytoscapeConfig'; // centrally configured instance

interface Person {
  id: number;
  name: string;
  sex: string;
  dob: string;
  comment: string;
  parentId: string;
}

const FamilyTreeUI = () => {
  const [people, setPeople] = useState([
    {
      id: 1,
      name: '',
      sex: '',
      dob: '',
      comment: '',
      parentId: ''
    }
  ] as Person[]);

  const cyRef = useRef(null as HTMLDivElement | null);
  const cyInstance = useRef(null as cytoscape.Core | null);

  // Update graph whenever people state changes
  useEffect(() => {
    if (!cyRef.current) return;

    // Destroy existing instance
    if (cyInstance.current) {
      cyInstance.current.destroy();
    }

    // Create nodes and edges
    const elements: any[] = [];
    
    // Add nodes
    people.forEach(person => {
      elements.push({
        data: {
          id: person.id.toString(),
          label: person.name || `#${person.id}`
        }
      });
    });

    // Add edges (parent -> child relationships)
    people.forEach(person => {
      if (person.parentId && person.parentId.trim() !== '') {
        elements.push({
          data: {
            id: `${person.parentId}-${person.id}`,
            source: person.parentId.toString(),
            target: person.id.toString()
          }
        });
      }
    });

    // Create new Cytoscape instance
    cyInstance.current = cytoscape({
      container: cyRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#6b7280', // grey pill
            'color': '#ffffff', // white text
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'shape': 'round-rectangle',
            'width': '80px',
            'height': '30px',
            'font-size': '12px',
            'font-family': 'system-ui, sans-serif'
          }
        },
        {
          selector: 'edge',
          style: {
            'curve-style': 'taxi',
            'taxi-direction': 'vertical',
            'taxi-turn-min-distance': 20,
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#6b7280',
            'line-color': '#6b7280',
            'width': 2
          }
        }
      ],
      layout: {
        name: 'elk',
        elk: {
          algorithm: 'layered',
          'elk.direction': 'DOWN',
          'elk.edgeRouting': 'ORTHOGONAL',
          'elk.layered.spacing.nodeNodeBetweenLayers': 160,
          'elk.spacing.nodeNode': 100,
        },
        animate: true,
        fit: true,
      } as any
    });

  }, [people]); // Updates on every keystroke via state changes

  const addPerson = () => {
    const newPerson: Person = {
      id: Date.now(), // Use Date.now() for new IDs
      name: '',
      sex: '',
      dob: '',
      comment: '',
      parentId: ''
    };
    setPeople([...people, newPerson]);
  };

  const updatePerson = (id: number, field: keyof Person, value: string) => {
    setPeople(people.map(person => 
      person.id === id 
        ? { ...person, [field]: field === 'id' ? parseInt(value) || id : value }
        : person
    ));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cyInstance.current) {
        cyInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Table Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Family Tree Data Entry</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-medium text-gray-700">ID</th>
                  <th className="text-left p-3 font-medium text-gray-700">Name</th>
                  <th className="text-left p-3 font-medium text-gray-700">Sex</th>
                  <th className="text-left p-3 font-medium text-gray-700">DOB</th>
                  <th className="text-left p-3 font-medium text-gray-700">Comment</th>
                  <th className="text-left p-3 font-medium text-gray-700">Parent ID</th>
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <tr key={person.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm text-gray-600">{person.id}</td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={person.name}
                        onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
                        placeholder="Enter name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={person.sex}
                        onChange={(e) => updatePerson(person.id, 'sex', e.target.value)}
                        placeholder="M/F"
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={1}
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="date"
                        value={person.dob}
                        onChange={(e) => updatePerson(person.id, 'dob', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={person.comment}
                        onChange={(e) => updatePerson(person.id, 'comment', e.target.value)}
                        placeholder="Optional comment"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={person.parentId}
                        onChange={(e) => updatePerson(person.id, 'parentId', e.target.value)}
                        placeholder="Parent's ID"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6">
            <button
              onClick={addPerson}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Add Person
            </button>
          </div>
        </div>
      </div>

      {/* Visualization Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Family Tree Visualization</h2>
        </div>
        <div className="p-6">
          <div 
            ref={cyRef} 
            className="w-full border border-gray-200 rounded-lg bg-white"
            style={{ height: '600px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default FamilyTreeUI; 