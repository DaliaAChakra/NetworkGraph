import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';
import Dataset from "./data.json";

const NetworkChart = ({ chartConfig }) => {
  const networkRef = useRef(null);
  const networkData = useRef(null);
  const networkPositions = useRef({});

  useEffect(() => {
    const drawNetwork = (nodes, edges, chartConfig) => {
      // Store positions of existing nodes
      const existingNodePositions = {};
      nodes.forEach(node => {
        existingNodePositions[node.id] = { x: node.x, y: node.y };
      });

      // Set shape and image for nodes
      nodes.forEach(node => {
        node.shape = 'image';
      });

      // Add image URLs for nodes
      nodes.forEach(node => {
        // Ensure that the image URL is correctly specified in the data.json file
        console.log(`Node ${node.id} image URL:`, node.image);
        // Ensure that the image URL is accessible
        console.log(`Attempting to load image for Node ${node.id}...`);
      });

      const data = {
        nodes: [...nodes],
        edges: [...edges],
      };

      const options = {
        ...chartConfig,
        layout: {
          randomSeed: undefined, // Disable random layout
        },
        physics: {
          enabled: false, // Disable physics simulation
        },
        edges: {
          smooth: {
            enabled: false, // Disable edge smoothing for straight lines
          },
        },
        interaction: {
          dragNodes: true, // Allow dragging nodes in 2D space
        },
      };

      const container = document.getElementById('network-chart');
      const network = new Network(container, data, options);

      networkData.current = { nodes: data.nodes, edges: data.edges };
      networkPositions.current = existingNodePositions;

      network.on('click', function(event) {
        const { nodes: clickedNodes } = event;
        if (clickedNodes.length === 1) {
          const clickedNodeId = clickedNodes[0];
          const edgesToShow = edges.filter(edge => edge.from === clickedNodeId || edge.to === clickedNodeId);
          const newNodes = nodes.filter(node => edgesToShow.some(edge => edge.from === node.id || edge.to === node.id));
          const newEdges = edges.filter(edge => newNodes.some(node => node.id === edge.from || edge.to === node.id));

          // Apply positions to new nodes
          newNodes.forEach(node => {
            if (networkPositions.current.hasOwnProperty(node.id)) {
              node.x = networkPositions.current[node.id].x;
              node.y = networkPositions.current[node.id].y;
            }
          });

          networkData.current.nodes.push(...newNodes.filter(node => !networkData.current.nodes.some(n => n.id === node.id)));
          networkData.current.edges.push(...newEdges.filter(edge => !networkData.current.edges.some(e => e.id === edge.id)));
          network.setData(networkData.current);
        }
      });

      return network;
    };

    const network = drawNetwork(Dataset.nodes, Dataset.edges, chartConfig);
    networkRef.current = network;

    return () => {
      network && network.destroy();
    };
  }, [chartConfig]);

  return <div id="network-chart" style={{ width: '100%', height: '700px' }}></div>;
};

export default NetworkChart;
