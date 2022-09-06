/**
 * Priority Queue.ts
 * -----------------
 * by Mike Liao
 * 
 * Defines the priority queue that contains jobs. The ordering is based on 
 * the jobs' time delays in miliseconds. 
 */

interface Comparable {
  less(that: Comparable): boolean;
  key(): number;
  set_key(new_key: number): void;
};

/* A priority queue that supports retrieving the minimum node in a
   binary tree in O(log(n)) runtime. The data structure is based on 
   implementation of min-heap.

   The data structure maintains the binary tree as an array. To 
   simplify the indexing to find subtree (a node's parent, its
   left child node and the right one), the implementation distinguishes
   Node index from the tree index. Node index starts at 1, which also
   represents the root of the tree while the tree_list starts at 0, 
   as does an array normal do. */
class PriorityQueue {
  tree_list: Comparable[];

  constructor() {
    this.tree_list = [];
  }

  /* Returns the number of nodes in the tree. */
  heap_size(): number {
    return this.tree_list.length;
  }

  /**
   * @param idx Node index of the current node.
   * @returns The parent node index of IDX.
   */
  parent(idx: number): number {
    return idx >> 1;
  }

  /**
   * @param idx Node index of the current node.
   * @returns The left child node index of IDX.
   */
  left(idx: number): number {
    return idx << 1;
  }

  /**
   * @param idx Node index of the current node.
   * @returns The right child node index of IDX.
   */
  right(idx: number): number {
    return (idx << 1) + 1;
  }

  /**
   * @param idx Node index.
   * @returns The node object stored in the tree_list.
   */
  node(idx: number): Comparable {
    if (idx < 1)
      throw new Error("Node index should be at least 1.");

    return this.tree_list[idx - 1];
  }

  /**
   * @returns The min node, i.e. the root node.
   */
  min_node(): Comparable {
    return this.tree_list[0];
  }

  /**
   * @param i One of the nodes with node index I to be exchanged.
   * @param j Another node with node index J to be exchanged.
   */
  /* Exchanges the tree parent with its larger child. */
  swap_node(i: number, j: number) {
    if (i < 1 || j < 1)
      throw new Error("Node indices should be at least 1.");

    const temp = this.node(i);
    this.tree_list[i - 1] = this.node(j);
    this.tree_list[j - 1] = temp;
  }

  /**
   * The function looks at node IDX and compares if it's children nodes
   * (left and right) are smaller than node IDX. If so, it will perform
   * swap with the smaller child to maintain the min-heap invariant.
   * 
   * @param idx The node of node index IDX. 
   */
  heapify(idx: number) {
    let smallest = idx;
    const lhs = this.left(idx);
    const rhs = this.right(idx);

    if (lhs <= this.heap_size() && this.node(lhs).less(this.node(idx)))
      smallest = lhs;
    if (rhs <= this.heap_size() && this.node(rhs).less(this.node(smallest)))
      smallest = rhs;

    if (smallest == idx)
      return;

    /* Exchanges the tree parent with its larger child. */
    this.swap_node(idx, smallest);

    /* Calls heapify on the subtree. */
    this.heapify(smallest);
  }

  /* Inserts a new node into the priority queue while maintaining
     the min-heap invariant. */
  insert(node: Comparable) {
    /* Inserts the node at the end of the tree. */
    let node_idx = this.heap_size() + 1;
    this.tree_list.push(node);
    
    /* Exchanges the new node with parent until the heap property
       is maintained. */
    let parent_idx = this.parent(node_idx);
    while (parent_idx > 0 && this.node(node_idx).less(this.node(parent_idx))) {
      this.swap_node(node_idx, parent_idx);
      node_idx = parent_idx;
      parent_idx = this.parent(node_idx);
    }
  }

  /* Retrieves the minimum node in the priority queue and pops it
     off from the min-heap. The function will call heapify() unitl
     the min-heap invariant is maintained after the pop. */
  extract_min(): Comparable {
    if (this.heap_size() < 1)
      throw new Error("There is no more node in the heap.");
      
    this.swap_node(1, this.heap_size());
    const min_node = this.tree_list.pop();
      
    if (min_node === undefined)
      throw new Error("Corrupt heap. Unable to extract the last node.");

    this.heapify(1);
    return min_node;
  }

  /**
   * Decreases NODE's key to NEW_KEY. The operation will exchange nodes
   * whose relative positions are out of place due to the decrease. The
   * key has to be lower than the original key. Otherwise, the ops will
   * throw an error. If NODE is not in the heap, the ops will also throw
   * an error so the user is responsible for providing a correct reference
   * to NODE.
   * 
   * @param node The node whose key is to be decreased.
   * @param new_key The new key. 
   */
  decrease_key(node: Comparable, new_key: number) {
    if (new_key > node.key())
      throw new Error("Try setting new key that is greater than the old one.");

    let found: Comparable | null = null;
    let node_idx = 0;
    for (let i = 0; i < this.heap_size(); i++) {
      if (this.tree_list[i] == node) {
        found = this.tree_list[i];
        node_idx = i + 1;
      }
    }

    if (found == null)
      throw new Error("Failed to locate the node to perform decrease key.");

    found.set_key(new_key);
    let parent_idx = this.parent(node_idx);
    while (parent_idx > 0 && this.node(node_idx).less(this.node(parent_idx))) {
      this.swap_node(node_idx, parent_idx);
      node_idx = parent_idx;
      parent_idx = this.parent(parent_idx);
    }
  }

  /* Used in debug. */
  dump() {
    let output = "";
    let tree_lvl_mask = 0b10;

    /* Appends a new line to start a new level in depth in the tree. */
    for (let i = 0; i < this.heap_size(); i++) {
      if ((tree_lvl_mask & (i + 1)) > 0) {
        output += "\n";
        tree_lvl_mask <<= 1;
      }
      output += "\t";
      output += this.tree_list[i].key();
    }
    output +="\n";
    console.log("min-heap shape:\n", output);
  }
}

export { Comparable, PriorityQueue };