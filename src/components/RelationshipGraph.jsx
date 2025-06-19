import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import '../cytoscapeConfig'; // registers dagre & elk once
import initialElements from '../data/initial-elements';
import styles from './RelationshipGraph.module.css';

const RelationshipGraph = () => {
  const layout = {
    name: 'elk',
    elk: {
      algorithm: 'layered',
      'elk.direction': 'DOWN',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.layered.spacing.nodeNodeBetweenLayers': 160,
      'elk.spacing.nodeNode': 100,
    },
    fit: true,
    animate: true,
    animationDuration: 500,
  };

  const stylesheet = [
    {
      selector: 'node',
      style: {
        'shape': 'rectangle',
        'width': '150px',
        'height': '50px',
        'background-color': 'var(--node-bg-color)',
        'border-width': 1,
        'border-color': 'var(--node-border-color)',
        'label': (ele) => {
          const name = ele.data('label') || '';
          const dob = ele.data('dob');
          return dob ? `${name}\nDOB: ${dob}` : name;
        },
        'text-valign': 'center',
        'text-halign': 'center',
        'text-wrap': 'wrap',
        'text-max-width': '140px',
        'line-height': 1.4,
        'font-family': 'Lato, sans-serif',
        'font-weight': 300,
        'font-size': 'var(--node-label-font-size)',
        'color': 'var(--color-text)'
      }
    },
    {
      selector: 'edge',
      style: {
        'label': 'data(label)',
        'font-family': 'Lato, sans-serif',
        'font-weight': 300,
        'font-size': 'var(--edge-label-font-size)',
        'color': 'var(--color-text)',
        'curve-style': 'taxi',
        'taxi-direction': 'vertical',
        'taxi-turn-min-distance': '20px',
        'line-color': 'var(--edge-color)',
        'target-arrow-shape': 'triangle',
        'target-arrow-color': 'var(--edge-color)'
      }
    }
  ];

  return (
    <div className={styles.graphContainer}>
      <CytoscapeComponent
        elements={initialElements}
        style={{ width: '100%', height: '100%' }}
        layout={layout}
        stylesheet={stylesheet}
      />
    </div>
  );
};

export default RelationshipGraph; 