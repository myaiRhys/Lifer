import { get, set } from 'idb-keyval'
import { KEYS } from './keys'
import type { OutcomeNode } from '../types'
import { getTasks } from './tasks'

function generateUUID(): string {
  return crypto.randomUUID()
}

export async function getOutcomeNodes(): Promise<OutcomeNode[]> {
  return await get(KEYS.OUTCOME_NODES) || []
}

export async function getOutcomeNodeById(id: string): Promise<OutcomeNode | undefined> {
  const nodes = await getOutcomeNodes()
  return nodes.find(n => n.id === id)
}

export async function createOutcomeNode(
  type: OutcomeNode['type'],
  title: string,
  description: string,
  parentId?: string,
  color: string = '#3b82f6'
): Promise<OutcomeNode> {
  const nodes = await getOutcomeNodes()

  const node: OutcomeNode = {
    id: generateUUID(),
    type,
    title,
    description,
    parentId,
    childIds: [],
    progress: 0,
    color,
    isActive: true,
    createdAt: new Date().toISOString(),
    linkedTaskCount: 0
  }

  nodes.push(node)

  // Update parent's childIds if exists
  if (parentId) {
    const parent = nodes.find(n => n.id === parentId)
    if (parent) {
      parent.childIds.push(node.id)
    }
  }

  await set(KEYS.OUTCOME_NODES, nodes)
  return node
}

export async function updateOutcomeNode(id: string, updates: Partial<OutcomeNode>): Promise<OutcomeNode | null> {
  const nodes = await getOutcomeNodes()
  const index = nodes.findIndex(n => n.id === id)

  if (index === -1) return null

  nodes[index] = { ...nodes[index], ...updates }
  await set(KEYS.OUTCOME_NODES, nodes)

  // Recalculate progress for all parent nodes
  await recalculateAllProgress()

  return nodes[index]
}

export async function deleteOutcomeNode(id: string): Promise<boolean> {
  const nodes = await getOutcomeNodes()
  const node = nodes.find(n => n.id === id)

  if (!node) return false

  // Remove from parent's childIds
  if (node.parentId) {
    const parent = nodes.find(n => n.id === node.parentId)
    if (parent) {
      parent.childIds = parent.childIds.filter(cid => cid !== id)
    }
  }

  // Remove node and all its children
  const toRemove = [id, ...getAllDescendants(id, nodes)]
  const filtered = nodes.filter(n => !toRemove.includes(n.id))

  await set(KEYS.OUTCOME_NODES, filtered)
  await recalculateAllProgress()
  return true
}

function getAllDescendants(nodeId: string, allNodes: OutcomeNode[]): string[] {
  const node = allNodes.find(n => n.id === nodeId)
  if (!node) return []

  let descendants: string[] = []
  for (const childId of node.childIds) {
    descendants.push(childId)
    descendants = descendants.concat(getAllDescendants(childId, allNodes))
  }

  return descendants
}

async function calculateNodeProgress(node: OutcomeNode, allNodes: OutcomeNode[]): Promise<number> {
  // If it's a milestone, check linked tasks
  if (node.type === 'milestone') {
    const tasks = await getTasks()
    const linkedTasks = tasks.filter(t => t.outcomeId === node.id)
    node.linkedTaskCount = linkedTasks.length

    if (linkedTasks.length === 0) return 0

    const completedTasks = linkedTasks.filter(t => t.completed).length
    return Math.round((completedTasks / linkedTasks.length) * 100)
  }

  // For purpose and outcome nodes, calculate based on children
  if (node.childIds.length === 0) return 0

  const children = allNodes.filter(n => node.childIds.includes(n.id))
  const totalProgress = children.reduce((sum, child) => sum + child.progress, 0)
  return Math.round(totalProgress / children.length)
}

export async function recalculateAllProgress(): Promise<void> {
  const nodes = await getOutcomeNodes()

  // Calculate progress bottom-up (milestones -> outcomes -> purposes)
  const milestones = nodes.filter(n => n.type === 'milestone')
  const outcomes = nodes.filter(n => n.type === 'outcome')
  const purposes = nodes.filter(n => n.type === 'purpose')

  // Update milestones first
  for (const milestone of milestones) {
    milestone.progress = await calculateNodeProgress(milestone, nodes)
  }

  // Then outcomes
  for (const outcome of outcomes) {
    outcome.progress = await calculateNodeProgress(outcome, nodes)
  }

  // Finally purposes
  for (const purpose of purposes) {
    purpose.progress = await calculateNodeProgress(purpose, nodes)
  }

  await set(KEYS.OUTCOME_NODES, nodes)
}

export async function getRootNodes(): Promise<OutcomeNode[]> {
  const nodes = await getOutcomeNodes()
  return nodes.filter(n => !n.parentId && n.isActive)
}

export async function getChildNodes(parentId: string): Promise<OutcomeNode[]> {
  const nodes = await getOutcomeNodes()
  return nodes.filter(n => n.parentId === parentId && n.isActive)
}

export async function archiveOutcomeNode(id: string): Promise<OutcomeNode | null> {
  return updateOutcomeNode(id, { isActive: false })
}
