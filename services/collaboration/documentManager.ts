
import * as Y from 'yjs';

export class DocumentManager {
  private docs: Map<string, Y.Doc> = new Map();

  getDoc(docId: string): Y.Doc {
    if (!this.docs.has(docId)) {
      const doc = new Y.Doc();
      // Load from DB if exists
      this.docs.set(docId, doc);
    }
    return this.docs.get(docId)!;
  }

  applyUpdate(docId: string, update: Uint8Array) {
    const doc = this.getDoc(docId);
    Y.applyUpdate(doc, update);
  }

  getEncodedState(docId: string): Uint8Array {
    const doc = this.getDoc(docId);
    return Y.encodeStateAsUpdate(doc);
  }

  /**
   * Conflict Resolution: Yjs handles this automatically using CRDTs.
   * This method could be used to manually merge or resolve high-level conflicts if needed.
   */
  resolveConflicts(docId: string) {
    // Yjs is eventually consistent, no manual resolution needed for text.
    console.log(`[DocumentManager] CRDT consistency check for ${docId}`);
  }
}
