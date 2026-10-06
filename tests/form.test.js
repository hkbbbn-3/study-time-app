const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname,'../script.js'),'utf8');
function load(c,start,end){
  vm.createContext(c);
  vm.runInContext(source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start))),c);
}
test('deadline save follows live input, including clearing and whitespace',()=>{
  const button = {disabled:true};
  const c = {ui:{deadlineEditor:{label:''}},document:{querySelector:()=>button}};
  load(c,'function onInput(e){','function onChange(e){');
  for(const [value,disabled] of [['試験',false],['',true],['  ',true],['再入力',false]]){
    c.onInput({target:{dataset:{field:'deadline-edit-label'},value}});
    assert.equal(button.disabled,disabled);
    assert.equal(c.ui.deadlineEditor.label,value);
  }
});
test('minute choices retain every timer remainder, including 27 and 59',()=>{
  // Check the selected HTML option, since a browser silently falls back to zero
  // when the renderer omits the imported/timer minute value.
  for(let minute=0;minute<60;minute++){
    const c = {ui:{form:{editingId:'r',date:'2026-10-05',hours:0,minutes:minute,subjectIds:['s']}},
      state:{subjects:[]},recordsOn:()=>[],renderTimerCard:()=>'',icon:()=>'',formatDateFull:()=>'',formatDateJp:()=>'',escapeHtml:()=>''};
    load(c,'function renderRecord(){','function formatDateJp(iso){');
    const html = c.renderRecord().match(/<select data-field="minutes">([\s\S]*?)<\/select>/)[1];
    assert.match(html,new RegExp(`<option value="${minute}" selected>`));
  }
});

test('27-minute edit persists unchanged through both click and Enter submission',()=>{
  for(const keyboard of [false,true]){
    const record = {id:'r',date:'2026-10-05',subjectId:'s',minutes:27,memo:''};
    const c = {state:{records:[record]},ui:{tab:'record',form:{editingId:'r',date:record.date,subjectIds:['s'],hours:0,minutes:27,memo:'追記'}},
      document:{querySelector:selector=>({value:selector.includes('hours')?'0':selector.includes('minutes')?'27':'追記'})},
      showToast:()=>{},showRecordSaveFeedback:()=>{},persist:()=>{},returnFromEdit:()=>{},resetForm:()=>{},render:()=>{},goalFor:()=>0,totalOn:()=>27,isoToday:()=>record.date};
    load(c,'function submitRecord(){','// After editing a record');
    load(c,'function submitRecordFromKeyboard(){','function onClick(e){');
    if(keyboard) c.submitRecordFromKeyboard(); else c.submitRecord();
    assert.equal(record.minutes,27);
    assert.equal(record.memo,'追記');
  }
});
