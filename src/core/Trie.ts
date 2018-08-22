/* tslint:disable:max-classes-per-file ... */
const defaultOption = {
  delimiter: '/',
};

interface ITrieNodeChildren {
  [key: string]: TrieNode;
}

class TrieNode {
  token: string;

  private value: any;
  private children: ITrieNodeChildren;
  private parent: TrieNode;

  constructor(token: string, value = null) {
    this.token = token;
    this.value = value;
    this.children = {};
    this.parent = null;
  }

  // is store value
  isLoaded() {
    return this.value !== null;
  }

  setValue(value: any): TrieNode {
    this.value = value;
    return this;
  }

  getValue(): any {
    return this.value;
  }

  clearValue(): TrieNode {
    this.value = null;
    return this;
  }

  getParent(): TrieNode {
    return this.parent;
  }

  getChildren(): TrieNode[] {
    return Object.keys(this.children).map(key => this.children[key]);
  }

  addChild(token: string, childNode: TrieNode): TrieNode {
    this.children[token] = childNode;
    childNode.parent = this;
    return this;
  }

  getChild(token: string): TrieNode {
    return this.children[token];
  }

  removeChild(node: TrieNode) {
    return delete this.children[node.token];
  }

  getChildrenNum(): number {
    return Object.keys(this.children).length;
  }

  hasChild(token): boolean {
    return this.children[token] !== undefined ? true : false;
  }
}

export default class Trie {
  private option: any;
  private root: TrieNode;

  constructor(dict: any, option?: any) {
    this.option = Object.assign({}, defaultOption, option);
    this.root = new TrieNode('@root');
    Object.keys(dict).forEach(key => this.add(key, dict[key]));
  }

  empty() {
    this.root = new TrieNode('@root');
  }

  isEmpty() {
    return this.root.getChildrenNum() <= 0;
  }

  add(path: string | string[], value): void {
    const tokens = Array.isArray(path) ? path : this.splitPath(path);
    const bottomNode = tokens.reduce((parent, token) => {
      let node = parent.getChild(token);
      if (node === undefined) {
        node = new TrieNode(token);
        parent.addChild(token, node);
      }
      return node;
    }, this.root);
    bottomNode.setValue(value);
  }

  remove(path: string | string[]): boolean {
    const tokens = Array.isArray(path) ? path : this.splitPath(path);
    const node = this.findNode(this.root, tokens);
    if (!node) {
      return false;
    }

    if (node.getChildrenNum() > 0) {
      node.clearValue();
      return true;
    }

    node.clearValue();
    let current = node;
    let parent;
    // tslint:disable-next-line no-conditional-assignment
    while (!current.isLoaded() && current.getChildrenNum() <= 0 && (parent = current.getParent())) {
      parent.removeChild(current);
      current = parent;
    }
    return true;
  }

  findPrefix(path: string | string[]): any {
    const tokens = Array.isArray(path) ? path : this.splitPath(path);
    const node = this.findPrefixNode(this.root, tokens);
    return node.getValue();
  }

  clearPrefix(path: string | string[]): any {
    const tokens = Array.isArray(path) ? path : this.splitPath(path);
    const node = this.findPrefixNode(this.root, tokens);
    return node.clearValue();
  }

  findPrefixNode(parent: TrieNode, tokens: string[]): TrieNode | null {
    let result = parent;

    const tokensQueue = tokens.slice().reverse();

    let curentNode = this.root;
    do {
      curentNode = curentNode.getChild(tokensQueue.pop());
      if (curentNode === undefined) {
        break;
      }

      if (curentNode.isLoaded()) {
        result = curentNode;
      }
    } while (tokensQueue.length > 0);

    return result;
  }

  findNode(parent: TrieNode, tokens: string[]): TrieNode | null {
    const [top, ...rest] = tokens;
    if (top === undefined) {
      return parent;
    }

    const childNode = parent.getChild(top);
    if (childNode !== undefined) {
      return this.findNode(childNode, rest);
    }
    return null;
  }

  getAllValues(): any[] {
    const nodeQueue = [this.root];
    const result = [];

    do {
      const curentNode = nodeQueue.shift();
      if (curentNode.isLoaded()) {
        result.push(curentNode.getValue());
      }

      const childrenNodes = curentNode.getChildren();
      nodeQueue.push(...childrenNodes);
    } while (nodeQueue.length > 0);

    return result;
  }

  findValuesWithShortestBranch(): any[] {
    const nodeQueue = [this.root];
    const result = [];

    do {
      const curentNode = nodeQueue.shift();
      if (curentNode.isLoaded()) {
        result.push(curentNode.getValue());
      } else {
        const childrenNodes = curentNode.getChildren();
        nodeQueue.push(...childrenNodes);
      }
    } while (nodeQueue.length > 0);

    return result;
  }

  splitPath(path: string): string[] {
    let normalizePath = path;
    if (normalizePath[0] === this.option.delimiter) {
      normalizePath = normalizePath.substr(1);
    }
    if (normalizePath[normalizePath.length - 1] === this.option.delimiter) {
      normalizePath = normalizePath.substr(0, normalizePath.length - 1);
    }
    return normalizePath.split(this.option.delimiter);
  }
}
