import { PersonRow } from '../store/useFamilyStore'

// Интерфейсы элементов Cytoscape
export interface CytoscapeNode {
  data: { id: string; label: string; type: 'person' | 'junction' }
  position: { x: number; y: number }
}
export interface CytoscapeEdge {
  data: { id: string; source: string; target: string }
}
export interface CytoscapeElements {
  nodes: CytoscapeNode[]
  edges: CytoscapeEdge[]
  subject?: PersonRow
}

// --- этап 1: только сетка 100×100 и ранги ---
const CELL = 100               // 1 узел решётки = 100px
// Уменьшаем вертикальные отступы в 3 раза: порты теперь на 1⁄4 клетки
const PORT_OFFSET = CELL / 4   // 25px вверх/вниз
const GRID_STEP_X = 2          // горизонтальный шаг остаётся прежним
// Вертикальный шаг между рангами был 3·CELL (=300px), станет 1·CELL (=100px)
const GRID_STEP_Y = 1          // так расстояние между супругами и детьми сокращается втрое
// Дополнительный вертикальный отступ по просьбе пользователя
const RANK_EXTRA_Y = 50        // добавляем 50px к каждому уровню

export const parseFamilyTree = (rows: PersonRow[]): CytoscapeElements => {
  const people = rows.filter(r => r.name.trim() !== '')
  if (people.length === 0) return { nodes: [], edges: [] }

  const subject = people.find(p => p.ifSubject === 1) || people[0]

  // helper rank
  const rankOf = (p: PersonRow): number => {
    if (subject.parentIds?.split(',').map(s => s.trim()).includes(p.id.toString())) return -1
    if (p.id === subject.id || p.parentIds === subject.parentIds) return 0
    if (subject.spouseIds?.split(',').map(s => s.trim()).includes(p.id.toString())) return 1
    if (p.parentIds?.split(',').map(s => s.trim()).includes(subject.id.toString())) return 2
    return 3
  }

  // group by rank
  const ranks = new Map<number, PersonRow[]>()
  people.forEach(p => {
    const r = rankOf(p)
    if (!ranks.has(r)) ranks.set(r, [])
    ranks.get(r)!.push(p)
  })

  // assign positions
  const nodes: CytoscapeNode[] = []
  const edges: CytoscapeEdge[] = []

  const ports = new Map<string, { top?: string; bottom?: string }>()

  // precompute hasChildren map
  const hasChildrenMap = new Map<string, boolean>()
  people.forEach(p => {
    if (!p.parentIds) return
    p.parentIds.split(',').map(s=>s.trim()).forEach(pid => {
      if (pid) hasChildrenMap.set(pid, true)
    })
  })

  Array.from(ranks.entries())
    .sort((a, b) => a[0] - b[0])
    .forEach(([rank, persons]) => {
      let gridX = 0
      persons.forEach(p => {
        const xCenter = (gridX + 0.5) * CELL
        const yCenter = (rank * GRID_STEP_Y + 0.5) * CELL + rank * RANK_EXTRA_Y
        nodes.push({
          data: { id: p.id.toString(), label: p.name, type: 'person' },
          position: { x: xCenter, y: yCenter }
        })
        gridX += GRID_STEP_X

        const hasParents = !!(p.parentIds && p.parentIds.trim() !== '')
        const hasChildren = hasChildrenMap.get(p.id.toString()) === true

        const portRecord: { top?: string; bottom?: string } = {}

        if (hasParents) {
          const topId = `pt-${p.id}-t`
          const topPos = { x: xCenter, y: yCenter - PORT_OFFSET }
          nodes.push({ data: { id: topId, label: '', type: 'junction' }, position: topPos })
          edges.push({ data: { id: `${topId}-${p.id}`, source: topId, target: p.id.toString() } })
          portRecord.top = topId
        }

        if (hasChildren) {
          const bottomId = `pt-${p.id}-b`
          const botPos = { x: xCenter, y: yCenter + PORT_OFFSET }
          nodes.push({ data: { id: bottomId, label: '', type: 'junction' }, position: botPos })
          edges.push({ data: { id: `${p.id}-${bottomId}`, source: p.id.toString(), target: bottomId } })
          portRecord.bottom = bottomId
        }

        if (portRecord.top || portRecord.bottom) {
          ports.set(p.id.toString(), portRecord)
        }
      })
    })

  // build family buses (parents -> children)
  const families = new Map<string, PersonRow[]>()
  people.forEach(ch => {
    if (!ch.parentIds) return
    const key = ch.parentIds.split(',').map(s=>s.trim()).sort().join('-')
    if (!families.has(key)) families.set(key, [])
    families.get(key)!.push(ch)
  })

  families.forEach((children, key) => {
    const parentIds = key.split('-')
    const parentPorts = parentIds.map(id => ports.get(id)?.bottom).filter(Boolean) as string[]
    const childPorts = children.map(c => ports.get(c.id.toString())?.top).filter(Boolean) as string[]
    if (!parentPorts.length || !childPorts.length) return

    // Check if this family is subject + spouse (two parents, includes subjectId)
    const isSubjectFamily = subject && parentIds.length === 2 && parentIds.includes(subject.id.toString())
    if (isSubjectFamily) {
      // Identify mother (spouse) id as the one not equal to subject
      const motherId = parentIds.find(id => id !== subject!.id.toString())!
      const motherPort = ports.get(motherId)?.bottom
      if (!motherPort) return

      // connect each child directly below mother
      childPorts.forEach(cp => {
        // ensure same x: adjust child top port x if needed (shift child subtree)
        const motherX = nodes.find(n=>n.data.id===motherPort)!.position.x
        const childTopNode = nodes.find(n=>n.data.id===cp)!
        const deltaX = motherX - childTopNode.position.x
        if (deltaX !==0) {
          const descSet = new Set<string>()
          const childId = cp.replace(/pt-(\d+)-t/, '$1')
          collectDescendants(childId, descSet)
          descSet.add(childId)
          shiftNodes(descSet, deltaX)
        }

        edges.push({ data: { id: `${motherPort}-${cp}`, source: motherPort, target: cp } })
      })
      return // skip generic bus creation
    }

    const yParent = nodes.find(n=>n.data.id===parentPorts[0])!.position.y
    const yChild = nodes.find(n=>n.data.id===childPorts[0])!.position.y
    const parentBusY = yParent + PORT_OFFSET
    const childBusY = yChild - PORT_OFFSET

    // parent bus junctions
    const parentJs:string[] = parentPorts.map(port=>{
      const x = nodes.find(n=>n.data.id===port)!.position.x
      const jid = `j-${port}-busp`
      nodes.push({data:{id:jid,label:'',type:'junction'},position:{x,y:parentBusY}})
      edges.push({data:{id:`${port}-${jid}`,source:port,target:jid}})
      return jid
    })

    // Determine midpoint on the bus
    const parentXs = parentJs.map(jid=>nodes.find(n=>n.data.id===jid)!.position.x)
    const minPX = Math.min(...parentXs)
    const maxPX = Math.max(...parentXs)
    const midPX = (minPX + maxPX) / 2

    let midJ = parentJs.find(jid=>nodes.find(n=>n.data.id===jid)!.position.x === midPX)
    if (!midJ) {
      midJ = `j-mid-${key}`
      nodes.push({data:{id:midJ,label:'',type:'junction'},position:{x:midPX,y:parentBusY}})
    }

    // rebuild horizontal bus: sort points by X then connect sequentially
    const busPoints = [...parentJs, midJ]
      .filter((v,i,a)=>a.indexOf(v)===i) // unique
      .sort((a,b)=> nodes.find(n=>n.data.id===a)!.position.x - nodes.find(n=>n.data.id===b)!.position.x)
    for(let i=0;i<busPoints.length-1;i++) {
      edges.push({data:{id:`${busPoints[i]}-${busPoints[i+1]}`,source:busPoints[i],target:busPoints[i+1]}})
    }

    // children bus junctions
    const childJs:string[] = childPorts.map(port=>{
      const x = nodes.find(n=>n.data.id===port)!.position.x
      const jid=`j-${port}-busc`
      nodes.push({data:{id:jid,label:'',type:'junction'},position:{x,y:childBusY}})
      edges.push({data:{id:`${jid}-${port}`,source:jid,target:port}})
      return jid
    })
    for(let i=0;i<childJs.length-1;i++) edges.push({data:{id:`${childJs[i]}-${childJs[i+1]}`,source:childJs[i],target:childJs[i+1]}})

    // vertical connector
    const midX = nodes.find(n=>n.data.id===midJ)!.position.x
    const topJ = `j-top-${key}`
    const bottomJ = `j-bot-${key}`
    nodes.push({data:{id:topJ,label:'',type:'junction'},position:{x:midX,y:parentBusY}})
    nodes.push({data:{id:bottomJ,label:'',type:'junction'},position:{x:midX,y:childBusY}})
    edges.push({data:{id:`${midJ}-${topJ}`,source:midJ,target:topJ}})
    edges.push({data:{id:`${topJ}-${bottomJ}`,source:topJ,target:bottomJ}})
    edges.push({data:{id:`${bottomJ}-${childJs[Math.floor(childJs.length/2)]}`,source:bottomJ,target:childJs[Math.floor(childJs.length/2)]}})
  })

  // --- pass 2: horizontally centre every children group under its parents ---

  // helper: map parent -> children list (direct only)
  const childrenByParent = new Map<string, string[]>()
  people.forEach(ch => {
    if (!ch.parentIds) return
    ch.parentIds.split(',').map(s => s.trim()).forEach(pid => {
      if (!childrenByParent.has(pid)) childrenByParent.set(pid, [])
      childrenByParent.get(pid)!.push(ch.id.toString())
    })
  })

  // recursion to collect all descendant person ids of a starting node
  const collectDescendants = (pid: string, set: Set<string>) => {
    if (set.has(pid)) return
    set.add(pid)
    const kids = childrenByParent.get(pid) || []
    kids.forEach(k => collectDescendants(k, set))
  }

  // helper to shift nodes by deltaX pixels for a given descendant set
  const shiftNodes = (descIds: Set<string>, deltaX: number) => {
    if (deltaX === 0) return
    nodes.forEach(n => {
      // rough test: shift if node id contains any descendant id as whole word
      for (const did of descIds) {
        if (n.data.id === did || n.data.id.includes(`-${did}-`) || n.data.id.endsWith(`-${did}`) || n.data.id.startsWith(`${did}-`)) {
          n.position.x += deltaX
          break
        }
      }
    })
  }

  families.forEach((children, key) => {
    const parentIds = key.split('-')
    const parentX: number[] = parentIds.map(pid => {
      const node = nodes.find(n => n.data.id === pid)
      return node ? node.position.x : 0
    })
    if (parentX.length === 0) return
    const busCenter = parentX.reduce((a, b) => a + b, 0) / parentX.length

    // compute children range
    const childX = children.map(ch => {
      const node = nodes.find(n => n.data.id === ch.id.toString())
      return node ? node.position.x : 0
    })
    if (childX.length === 0) return
    const minChildX = Math.min(...childX)
    const maxChildX = Math.max(...childX)
    const childCenter = (minChildX + maxChildX) / 2

    let delta = busCenter - childCenter
    // snap delta to GRID_STEP_X * CELL increments to keep even columns
    const snap = GRID_STEP_X * CELL
    delta = Math.round(delta / snap) * snap

    if (delta !== 0) {
      const descSet = new Set<string>()
      children.forEach(ch => collectDescendants(ch.id.toString(), descSet))
      shiftNodes(descSet, delta)
    }
  })

  // --- centre spouse group under subject ---
  if (subject && subject.spouseIds && subject.spouseIds.trim() !== '') {
    const spouseIds = subject.spouseIds.split(',').map(s=>s.trim()).filter(Boolean)
    const spouseXs = spouseIds.map(sid => {
      const node = nodes.find(n=>n.data.id===sid)
      return node ? node.position.x : undefined
    }).filter((x): x is number => x !== undefined)

    if (spouseXs.length) {
      const minSX = Math.min(...spouseXs)
      const maxSX = Math.max(...spouseXs)
      const groupCenter = (minSX + maxSX) / 2

      const subjNode = nodes.find(n=>n.data.id===subject.id.toString())
      if (subjNode) {
        let delta = subjNode.position.x - groupCenter
        const snap = GRID_STEP_X * CELL
        delta = Math.round(delta / snap) * snap

        if (delta !== 0) {
          const descSet = new Set<string>()
          spouseIds.forEach(sid => {
            descSet.add(sid)
            collectDescendants(sid, descSet)
          })
          shiftNodes(descSet, delta)
        }
      }
    }
  }

  // --- create spouse bus under subject (subject with multiple spouses) ---
  if (subject && subject.spouseIds && subject.spouseIds.trim() !== '') {
    const spouseIds = subject.spouseIds.split(',').map(s=>s.trim()).filter(Boolean)
    const subjBottom = ports.get(subject.id.toString())?.bottom
    if (subjBottom && spouseIds.length) {
      // bus Y coordinate equals wives' top port Y (take first wife)
      let busY: number
      const firstTop = spouseIds.map(id => ports.get(id)?.top).find(Boolean)
      if (firstTop) {
        // Располагаем шину посередине между нижним портом супруга и верхними портами жён
        const subjBottomY = nodes.find(n => n.data.id === subjBottom)!.position.y
        const spouseTopY = nodes.find(n => n.data.id === firstTop)!.position.y
        busY = (subjBottomY + spouseTopY) / 2
      } else {
        const subjY = nodes.find(n => n.data.id === subjBottom)!.position.y
        busY = subjY + PORT_OFFSET // запасной вариант
      }

      // midpoint under subject
      const midId = `j-spbus-${subject.id}`
      nodes.push({data:{id:midId,label:'',type:'junction'},position:{x:nodes.find(n=>n.data.id===subjBottom)!.position.x,y:busY}})
      edges.push({data:{id:`${subjBottom}-${midId}`,source:subjBottom,target:midId}})

      const spousePorts:string[] = []
      spouseIds.forEach(sid=>{
        // ensure spouse has top port
        let topPort = ports.get(sid)?.top
        const spouseNode = nodes.find(n=>n.data.id===sid)
        if (!spouseNode) return
        if (!topPort) {
          // create a new top port for the spouse, positioned one PORT_OFFSET below the bus
          topPort = `pt-${sid}-tsp`
          const pos = { x: spouseNode.position.x, y: busY + PORT_OFFSET }
          nodes.push({ data: { id: topPort!, label: '', type: 'junction' }, position: pos })
          // remember this port so we do not recreate it later
          const rec = ports.get(sid) || {}
          rec.top = topPort
          ports.set(sid, rec as any)
        } else {
          // ensure existing top port is exactly one PORT_OFFSET below the bus
          const n = nodes.find(n => n.data.id === topPort)!
          n.position.y = busY + PORT_OFFSET
        }
        // make sure the top port is connected to the spouse node itself
        const existingEdge = edges.find(e => e.data.source === topPort && e.data.target === sid)
        if (!existingEdge) {
          edges.push({ data: { id: `${topPort}-${sid}`, source: topPort, target: sid } })
        }
        // create junction on bus for this wife
        const jId = `j-sp-${sid}`
        nodes.push({data:{id:jId,label:'',type:'junction'},position:{x:spouseNode.position.x,y:busY}})
        // vertical edge jId -> topPort
        edges.push({data:{id:`${jId}-${topPort}`,source:jId,target:topPort}})

        spousePorts.push(jId)
      })

      // build full bus points: left to right spouse ports with mid included in correct X order
      const allPts = [...spousePorts, midId].sort((a,b)=>nodes.find(n=>n.data.id===a)!.position.x - nodes.find(n=>n.data.id===b)!.position.x)
      for(let i=0;i<allPts.length-1;i++) {
        edges.push({data:{id:`${allPts[i]}-${allPts[i+1]}`,source:allPts[i],target:allPts[i+1]}})
      }
    }
  }

  // --- align each child exactly under its mother (subject's spouse) ---
  if (subject && subject.spouseIds) {
    const spouseIds = subject.spouseIds.split(',').map(s=>s.trim()).filter(Boolean)
    spouseIds.forEach(spId=>{
      const motherX = nodes.find(n=>n.data.id===spId)!.position.x

      // children whose parentIds include both subject and this spouse
      const kids = people.filter(p=> {
        if (!p.parentIds) return false
        const ids = p.parentIds.split(',').map(t=>t.trim())
        return ids.includes(spId) && ids.includes(subject.id.toString())
      })

      kids.forEach(kid=>{
        const kidTop = ports.get(kid.id.toString())?.top
        if (!kidTop) return
        const kidTopNode = nodes.find(n=>n.data.id===kidTop)!
        const delta = motherX - kidTopNode.position.x
        if (delta!==0) {
          const set = new Set<string>()
          collectDescendants(kid.id.toString(), set)
          set.add(kid.id.toString())
          shiftNodes(set, delta)
        }

        // make sure edge exists vertically
        const motherBottom = ports.get(spId)?.bottom
        if (motherBottom) {
          edges.push({data:{id:`${motherBottom}-${kidTop}`,source:motherBottom,target:kidTop}})
        }
      })
    })
  }

  return { nodes, edges, subject }
}

export const validateFamilyTree = (_rows: PersonRow[]): string[] => [] 