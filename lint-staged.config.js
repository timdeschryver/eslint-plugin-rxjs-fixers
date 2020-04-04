module.exports = {
  '*.ts': ['eslint --fix', 'git add'],
  '*.json': ['eslint --fix', 'git add'],
  '*.md': ['prettier --write', 'git add'],
}
