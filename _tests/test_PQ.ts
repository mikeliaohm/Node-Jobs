import { Comparable, PriorityQueue } from "../src";

class MockNode implements Comparable {
  _key: number;
  key(): number { return this._key; }
  set_key(new_key: number): void { this._key = new_key; }
  less(that: Comparable): boolean { return this.key() < that.key(); }
  constructor(key: number) { this._key = key; }
}

test('One item in PQ', () => {
  let pq = new PriorityQueue();
  expect(pq.heap_size()).toBe(0);
  
  const node = new MockNode(0);
  pq.insert(node);
  expect(pq.heap_size()).toBe(1);
});

test('Two items in PQ', () => {
  let pq = new PriorityQueue();
  let key_list = [2, 0];
  for (let i = 0; i < 2; i++) {
    pq.insert(new MockNode(key_list[i]));  
  }
  expect(pq.heap_size()).toBe(2);

  expect(pq.tree_list[0].key()).toBe(0);
  expect(pq.tree_list[1].key()).toBe(2);
});

/* Insert key list [2, 1, 0] into PQ. The tree should be:
    0
  |   | 
  2   1
 */
test('Three items in PQ I', () => {
  let pq = new PriorityQueue();
  let key_list = [2, 1, 0];
  for (let i = 0; i < 3; i++) {
    pq.insert(new MockNode(key_list[i]));  
  }
  expect(pq.heap_size()).toBe(3);

  expect(pq.tree_list[0].key()).toBe(0);
  expect(pq.tree_list[1].key()).toBe(2);
  expect(pq.tree_list[2].key()).toBe(1);
});

/* Insert key list [1, 2, 0] into PQ. The tree should be:
    0
  |   | 
  2   1
 */
  test('Three items in PQ II', () => {
    let pq = new PriorityQueue();
    let key_list = [1, 2, 0];
    for (let i = 0; i < 3; i++) {
      pq.insert(new MockNode(key_list[i]));  
    }
    expect(pq.heap_size()).toBe(3);
  
    expect(pq.tree_list[0].key()).toBe(0);
    expect(pq.tree_list[1].key()).toBe(2);
    expect(pq.tree_list[2].key()).toBe(1);
  });

/* Insert key list [1, 0, 2] into PQ. The tree should be:
    0
  |   | 
  1   2
 */
  test('Three items in PQ III', () => {
    let pq = new PriorityQueue();
    let key_list = [1, 0, 2];
    for (let i = 0; i < 3; i++) {
      pq.insert(new MockNode(key_list[i]));  
    }
    expect(pq.heap_size()).toBe(3);
  
    expect(pq.tree_list[0].key()).toBe(0);
    expect(pq.tree_list[1].key()).toBe(1);
    expect(pq.tree_list[2].key()).toBe(2);
  });

  /* Insert key list [1, 0, 2] into PQ. The tree should be:
    0
  |   | 
  1   2
  */
  test('Retrieve min from 3 nodes', () => {
    let pq = new PriorityQueue();
    let key_list = [1, 0, 2];
    for (let i = 0; i < 3; i++) {
      pq.insert(new MockNode(key_list[i]));  
    }
    expect(pq.heap_size()).toBe(3);

    expect(pq.extract_min().key()).toBe(0);
    expect(pq.extract_min().key()).toBe(1);
    expect(pq.extract_min().key()).toBe(2);
  });
  
  test('Retrieve min from 10 nodes inserted in arbitrary order', () => {
    let pq = new PriorityQueue();
    /* List 1 to 10 in arbitrary order. */
    let key_list = [3, 5, 4, 1, 9, 6, 7, 8, 10, 2];
    for (let i = 0; i < 10; i++) {
      pq.insert(new MockNode(key_list[i]));
    }
    expect(pq.heap_size()).toBe(10);
    
    pq.dump();
    
    let sorted_list = key_list.sort((i, j) => i - j);
    for (let i = 0; i < 10; i++) {
      const key_i = pq.extract_min().key();
      expect(key_i).toBe(sorted_list[i]);
    }
  });

  test('Retrieve min from 10 nodes where 5 nodes have equal keys', () => {
    let pq = new PriorityQueue();
    /* List 1 to 10 in arbitrary order. */
    let key_list = [3, 5, 4, 1, 2, 5, 5, 5, 5, 5];
    for (let i = 0; i < 10; i++) {
      pq.insert(new MockNode(key_list[i]));
    }
    expect(pq.heap_size()).toBe(10);
    
    pq.dump();
    
    let sorted_list = key_list.sort((i, j) => i - j);
    for (let i = 0; i < 10; i++) {
      const key_i = pq.extract_min().key();
      expect(key_i).toBe(sorted_list[i]);
    }
  });

  test('Decrease key on a 3-item heap. Exchange happen on the right.', () => {
    let pq = new PriorityQueue();
    let key_list = [3, 1, 2];
  
    /* Stores the references to MockNode objects in this list. */
    let node_list: MockNode[] = [];
    for (let i = 0; i < 3; i++) {
      node_list.push(new MockNode(key_list[i]));
      pq.insert(node_list[i]);
    }
  
    expect(pq.heap_size()).toBe(3);
  
    pq.dump();
    expect(pq.tree_list[0].key()).toBe(1);
    expect(pq.tree_list[1].key()).toBe(3);
    expect(pq.tree_list[2].key()).toBe(2);
    
    /* Decreases key for node the key 3 (i.e. the 1st item 
      in node_list). This should move the node with new key
      0 to the root of the heap. */
    pq.decrease_key(node_list[2], 0);
    
    pq.dump();
    expect(pq.tree_list[0].key()).toBe(0);
    expect(pq.tree_list[1].key()).toBe(3);
    expect(pq.tree_list[2].key()).toBe(1);
  });

  test('Decrease key on a 3-item heap. Exchange happens on the left', () => {
    let pq = new PriorityQueue();
    let key_list = [33, 11, 22];
  
    /* Stores the references to MockNode objects in this list. */
    let node_list: MockNode[] = [];
    for (let i = 0; i < 3; i++) {
      node_list.push(new MockNode(key_list[i]));
      pq.insert(node_list[i]);
    }
  
    expect(pq.heap_size()).toBe(3);
  
    pq.dump();
    expect(pq.tree_list[0].key()).toBe(11);
    expect(pq.tree_list[1].key()).toBe(33);
    expect(pq.tree_list[2].key()).toBe(22);
    
    /* Decreases key for node the key 3 (i.e. the 1st item 
      in node_list). This should move the node with new key
      0 to the root of the heap. */
    pq.decrease_key(node_list[0], 10);
    
    pq.dump();
    expect(pq.tree_list[0].key()).toBe(10);
    expect(pq.tree_list[1].key()).toBe(11);
    expect(pq.tree_list[2].key()).toBe(22);
  });

test('Decrease key so that node moves to its proper spot', () => {
  let pq = new PriorityQueue();
  let key_list = [3, 5, 4, 1, 2];

  /* Stores the references to MockNode objects in this list. */
  let node_list: MockNode[] = [];
  for (let i = 0; i < 5; i++) {
    node_list.push(new MockNode(key_list[i]));
    pq.insert(node_list[i]);
  }

  expect(pq.heap_size()).toBe(5);

  pq.dump();
  expect(pq.tree_list[0].key()).toBe(1);
  expect(pq.tree_list[1].key()).toBe(2);
  expect(pq.tree_list[2].key()).toBe(4);
  expect(pq.tree_list[3].key()).toBe(5);
  expect(pq.tree_list[4].key()).toBe(3);
  
  /* Decreases key for node the key 3 (i.e. the 1st item 
    in node_list). This should move the node with new key
    0 to the root of the heap. */
  pq.decrease_key(node_list[0], 0);
  
  pq.dump();
  expect(pq.tree_list[0].key()).toBe(0);
  expect(pq.tree_list[1].key()).toBe(1);
  expect(pq.tree_list[2].key()).toBe(4);
  expect(pq.tree_list[3].key()).toBe(5);
  expect(pq.tree_list[4].key()).toBe(2);
});