// models/db.js — File-based JSON data store (no MongoDB setup required)
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

class Collection {
  constructor(name) {
    this.file = path.join(DATA_DIR, `${name}.json`);
    if (!fs.existsSync(this.file)) fs.writeFileSync(this.file, '[]');
  }

  _read() {
    try { return JSON.parse(fs.readFileSync(this.file, 'utf8')); }
    catch { return []; }
  }

  _write(data) { fs.writeFileSync(this.file, JSON.stringify(data, null, 2)); }

  findAll(filter = {}) {
    const docs = this._read();
    if (!Object.keys(filter).length) return docs;
    return docs.filter(d => Object.entries(filter).every(([k, v]) => d[k] === v));
  }

  findById(id) { return this._read().find(d => d.id === id) || null; }

  findOne(filter) {
    return this._read().find(d =>
      Object.entries(filter).every(([k, v]) => d[k] === v)
    ) || null;
  }

  create(doc) {
    const docs = this._read();
    const now = new Date().toISOString();
    const newDoc = { ...doc, createdAt: now, updatedAt: now };
    docs.push(newDoc);
    this._write(docs);
    return newDoc;
  }

  updateById(id, updates) {
    const docs = this._read();
    const i = docs.findIndex(d => d.id === id);
    if (i === -1) return null;
    docs[i] = { ...docs[i], ...updates, updatedAt: new Date().toISOString() };
    this._write(docs);
    return docs[i];
  }

  deleteById(id) {
    const docs = this._read();
    const i = docs.findIndex(d => d.id === id);
    if (i === -1) return false;
    docs.splice(i, 1);
    this._write(docs);
    return true;
  }

  count(filter = {}) { return this.findAll(filter).length; }
}

module.exports = {
  Users: new Collection('users'),
  Events: new Collection('events'),
  Tickets: new Collection('tickets'),
  SponsorRequests: new Collection('sponsor_requests'),
  SystemLogs: new Collection('system_logs'),
};
