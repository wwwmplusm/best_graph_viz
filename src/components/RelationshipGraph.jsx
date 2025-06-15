import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import initialElements from '../data/initial-elements';
import styles from './RelationshipGraph.module.css';

const RelationshipGraph = () => {
  const stylesheet = [
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-family': 'var(--font-family-primary)',
        'font-weight': 'var(--font-weight-light)',
        'font-size': 'var(--node-label-font-size)',
        'background-color': '#fff',
        'border-width': 1,
        'border-color': '#666',
        'padding': '10px'
      }
    },
    {
      selector: 'edge',
      style: {
        'label': 'data(label)',
        'font-family': 'var(--font-family-primary)',
        'font-weight': 'var(--font-weight-light)',
        'font-size': 'var(--edge-label-font-size)',
        'text-rotation': 'autorotate',
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle'
      }
    }
  ];

  return (
    <div className={styles.graphContainer}>
      <CytoscapeComponent
        elements={initialElements}
        style={{ width: '100%', height: '100%' }}
        layout={{ name: 'preset' }}
        stylesheet={stylesheet}
      />
    </div>
  );
};

export default RelationshipGraph; 