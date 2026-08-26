export type PaymentAllocation={total:number;charge:number;principal:number}
export function money(n:number){return Math.round((n+Number.EPSILON)*100)/100}
export function calculatePeriodCharge(principal:number,ratePercent:number){return money(principal*(ratePercent/100))}
export function allocatePayment(total:number,chargeDue:number,mode:'CHARGE_ONLY'|'CHARGE_AND_PRINCIPAL'|'PRINCIPAL_ONLY'|'CUSTOM',customCharge=0):PaymentAllocation{
 const t=money(total); if(mode==='CHARGE_ONLY') return {total:t,charge:money(Math.min(t,chargeDue)),principal:0};
 if(mode==='PRINCIPAL_ONLY') return {total:t,charge:0,principal:t};
 if(mode==='CUSTOM') {const c=money(Math.max(0,Math.min(customCharge,t)));return {total:t,charge:c,principal:money(t-c)}}
 const c=money(Math.min(t,chargeDue));return {total:t,charge:c,principal:money(t-c)}
}
export function daysRemaining(dueDate:string){const now=new Date();const due=new Date(dueDate+'T23:59:59');return Math.ceil((due.getTime()-now.getTime())/86400000)}
export function statusFor(principal:number,dueDate:string,paid:boolean,nearDueDays=3){if(principal<=0)return 'PAID';const d=daysRemaining(dueDate);if(d<0)return 'OVERDUE';if(d<=nearDueDays)return 'NEAR_DUE';if(paid)return 'PARTIAL';return 'ACTIVE'}
