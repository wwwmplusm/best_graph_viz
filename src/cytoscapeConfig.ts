import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import elk from 'cytoscape-elk'

// Register extensions only once to avoid duplicate-registration warnings
cytoscape.use(dagre)
cytoscape.use(elk)

export default cytoscape 