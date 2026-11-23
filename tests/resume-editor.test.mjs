import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const compile = source => 'data:text/javascript;base64,' + Buffer.from(ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText).toString('base64');
const factories = compile(await readFile(new URL('../src/lib/resumeContent.ts', import.meta.url), 'utf8'));
const adapterSource = (await readFile(new URL('../src/lib/resumeWire.ts', import.meta.url), 'utf8')).replace("'./resumeContent'", JSON.stringify(factories));
const { fromResumeWire, toResumeWire } = await import(compile(adapterSource));
const { SaveQueue } = await import(compile(await readFile(new URL('../src/lib/saveQueue.ts', import.meta.url), 'utf8')));
test('структурированные разделы сохраняют все поля и ID после полного круга API', () => {
  const content = { contacts: { fullName: 'Анна', position: '', email: '', location: '' }, about: 'Опыт', experience: [{id:'e1',company:'Компания',role:'Разработчик',period:'2024',achievements:'API'}], projects: [{id:'p1',name:'Проект',technologies:'Python',contribution:'Бэкенд'}], skills: ['C++','Python'], education: [{id:'ed1',institution:'Университет',specialty:'Информатика',period:'2020–2024'}], additional: [{id:'a1',title:'Языки',description:'English B2'}] };
  assert.deepEqual(fromResumeWire(toResumeWire(content)), content);
});
test('старые текстовые разделы не теряются и пустые записи не содержат примеров', () => {
  const loaded = fromResumeWire({contacts:{fullName:'',position:'',email:'',location:''},about:'',experience:[],projects:[],skills:'Python, SQL\nGit',education:'Старая анкета',additional:'Дополнение'});
  assert.deepEqual(loaded.skills,['Python','SQL','Git']);
  assert.equal(loaded.education[0].institution,'Старая анкета');
  assert.equal(loaded.additional[0].description,'Дополнение');
  assert.equal(loaded.projects[0].name,'');
});
test('быстрые правки записываются последовательно; промежуточные версии объединяются', async () => {
  const writes = []; let release;
  const gate = new Promise(resolve => {release=resolve;});
  const queue = new SaveQueue(async value => { writes.push(value); if(value===1) await gate; });
  queue.enqueue(1); const saving = queue.flush(); queue.enqueue(2); queue.enqueue(3);
  assert.deepEqual(writes,[1]); release(); await saving;
  assert.deepEqual(writes,[1,3]); assert.equal(queue.dirty,false);
});
test('сетевая ошибка сохраняет последнюю правку для повторной отправки', async () => {
  let fail=true; const writes=[];
  const queue = new SaveQueue(async value => { if(fail) throw new Error('offline'); writes.push(value); });
  queue.enqueue('правка'); await assert.rejects(queue.flush(), /offline/);
  assert.equal(queue.dirty,true); fail=false; await queue.flush();
  assert.deepEqual(writes,['правка']); assert.equal(queue.dirty,false);
});

const helpers = (await readFile(new URL('../src/lib/applyAnalysis.ts', import.meta.url), 'utf8')).replace("'./resumeContent'", JSON.stringify(factories));
const { applyProjectAnalysis } = await import(compile(helpers));
test('анализ заменяет пустую заготовку, не меняя другие проекты', () => {
  const other = {id:'other',repoId:'2',name:'Другой',technologies:'SQL',contribution:'Мой текст'};
  const draft = {id:'new',repoId:'1',name:'API',technologies:'Python',contribution:'Проверенный вклад'};
  assert.deepEqual(applyProjectAnalysis([{id:'blank',name:'',technologies:'',contribution:''},other],draft),[other,draft]);
  assert.equal(other.contribution,'Мой текст');
});
test('повторное применение обновляет существующий проект без дубля и сохраняет его ID', () => {
  const previous = {id:'stable-id',repoId:'1',name:'API',technologies:'Python',contribution:'Старый текст'};
  const draft = {id:'temporary',repoId:'1',name:'Новое название',technologies:'Python, SQL',contribution:'Новый текст'};
  const result = applyProjectAnalysis([previous],draft);
  assert.equal(result.length,1);
  assert.deepEqual(result[0],{...draft,id:'stable-id'});
  assert.equal(previous.contribution,'Старый текст');
});
