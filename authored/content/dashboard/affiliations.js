export const institutionTypeLabels={university:'大学',company:'企业',research:'研究机构',other:'独立／其他'};
export const institutionFilterLabels={all:'全部机构类型',university:'有大学参与',company:'有企业参与',research:'有研究机构参与',other:'独立／其他参与',collaboration:'校企合作',unknown:'单位待核实'};
export const institutionSearchText=p=>(p.institutions||[]).map(i=>`${i.name} ${i.nameEn}`).join(' ');
export function matchesInstitution(p,institution='all',institutionType='all'){
 const units=p.institutions||[];
 if(institution!=='all'&&!units.some(i=>i.id===institution))return false;
 if(institutionType==='unknown')return !units.length||p.affiliationStatus!=='verified';
 if(institutionType==='collaboration')return units.some(i=>i.type==='university')&&units.some(i=>i.type==='company');
 return institutionType==='all'||units.some(i=>i.type===institutionType);
}
export function institutionChoices(papers){
 const units=new Map();
 for(const p of papers)for(const i of p.institutions||[])units.set(i.id,i);
 return [...units.values()].sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'));
}
