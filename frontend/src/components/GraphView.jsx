import React, { useCallback } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'

const initialNodes = [
  { id: '1', position: { x: 300, y: 20  }, data: { label: 'ACC-4521\n₹1.2L' }, style: { background: '#FEF2F2', border: '2px solid #EF4444', borderRadius: 12, padding: '8px 14px', fontSize: 11, fontWeight: 700, color: '#374151', fontFamily: 'Inter' } },
  { id: '2', position: { x: 100, y: 160 }, data: { label: 'ACC-7832\n₹45K' },  style: { background: '#FFFBEB', border: '2px solid #F59E0B', borderRadius: 12, padding: '8px 14px', fontSize: 11, fontWeight: 700, color: '#374151', fontFamily: 'Inter' } },
  { id: '3', position: { x: 500, y: 160 }, data: { label: 'ACC-9910\n₹88K' },  style: { background: '#FFFBEB', border: '2px solid #F59E0B', borderRadius: 12, padding: '8px 14px', fontSize: 11, fontWeight: 700, color: '#374151', fontFamily: 'Inter' } },
  { id: '4', position: { x: 0,   y: 300 }, data: { label: 'ACC-3391\n₹12K' },  style: { background: '#F0FDF4', border: '2px solid #10B981', borderRadius: 12, padding: '8px 14px', fontSize: 11, fontWeight: 600, color: '#374151', fontFamily: 'Inter' } },
  { id: '5', position: { x: 200, y: 300 }, data: { label: 'ACC-2245\n₹5K' },   style: { background: '#F0FDF4', border: '2px solid #10B981', borderRadius: 12, padding: '8px 14px', fontSize: 11, fontWeight: 600, color: '#374151', fontFamily: 'Inter' } },
  { id: '6', position: { x: 420, y: 300 }, data: { label: 'ACC-1122\n₹30K' },  style: { background: '#FEF2F2', border: '2px solid #EF4444', borderRadius: 12, padding: '8px 14px', fontSize: 11, fontWeight: 700, color: '#374151', fontFamily: 'Inter' } },
  { id: '7', position: { x: 620, y: 300 }, data: { label: 'ACC-5500\n₹750' },  style: { background: '#F0FDF4', border: '2px solid #10B981', borderRadius: 12, padding: '8px 14px', fontSize: 11, fontWeight: 600, color: '#374151', fontFamily: 'Inter' } },
  { id: '8', position: { x: 310, y: 440 }, data: { label: '⚠ FRAUD RING\nDetected' }, style: { background: '#EF4444', border: 'none', borderRadius: 12, padding: '10px 18px', fontSize: 11, fontWeight: 800, color: '#fff', fontFamily: 'Inter' } },
]

const edge = (id, source, target, color = '#D1D5DB', label = '') => ({
  id, source, target, label,
  animated: color === '#EF4444',
  style: { stroke: color, strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color },
  labelStyle: { fontSize: 9, fill: '#9CA3AF', fontFamily: 'Inter' },
  labelBgStyle: { fill: '#fff' },
})

const initialEdges = [
  edge('e1-2', '1', '2', '#EF4444', '₹45K'),
  edge('e1-3', '1', '3', '#EF4444', '₹88K'),
  edge('e2-4', '2', '4', '#F59E0B', '₹12K'),
  edge('e2-5', '2', '5', '#F59E0B', '₹5K'),
  edge('e3-6', '3', '6', '#EF4444', '₹30K'),
  edge('e3-7', '3', '7', '#D1D5DB', '₹750'),
  edge('e6-8', '6', '8', '#EF4444', 'Mule'),
  edge('e5-8', '5', '8', '#EF4444', 'Mule'),
]

export default function GraphView() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const onConnect = useCallback((p) => setEdges((es) => addEdge(p, es)), [setEdges])

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 400 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-right"
      >
        <Background color="#E5E7EB" gap={20} size={1} />
        <Controls className="rounded-xl" />
        <MiniMap nodeColor={(n) => n.style?.border?.includes('EF4444') ? '#FEF2F2' : n.style?.border?.includes('F59E0B') ? '#FFFBEB' : '#F0FDF4'} />
      </ReactFlow>
    </div>
  )
}
