// Check what TPR returns for truck 298 and what already_inspected flag it has
const res = await fetch('https://crown-xpress-transport-ten.vercel.app/api/tpr?type=pending&yardCode=CXT6,CXT17')
const data = await res.json()

// Find truck 298
const truck298 = data.data.filter(m => m.truck_id?.trim() === '298' || m.bill_of_lading?.trim() === '298')
console.log('Truck 298 entries:', JSON.stringify(truck298, null, 2))

// Show all already_inspected
const inspected = data.data.filter(m => m.already_inspected)
console.log('\nAll already_inspected:', inspected.map(m => ({ bl: m.bill_of_lading, truck: m.truck_id, seal: m.seal })))
