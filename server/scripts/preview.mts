import path from 'path'
import { createTestDb } from '../test/helpers.js'
import { createApp } from '../src/app.js'

const db = createTestDb()
const app = createApp(db, { logging: false, clientDist: path.join(import.meta.dirname, '..', '..', 'client', 'dist') })
app.listen(8099, async () => {
  const base = 'http://127.0.0.1:8099/api'
  const post = (path: string, body: unknown) =>
    fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json())

  const tacos = await post('/recipes', { title: 'Tacos', comment: 'Familjens fredagsfavorit. Glöm inte guacamolen!', url: 'https://www.ica.se/recept/tacos' })
  const lax = await post('/recipes', { title: 'Ugnsbakad lax med citron', comment: '- 4 laxfiléer\n- 1 citron\n- dill och smör\n\nUgn 175° i ca 25 min.', url: '' })
  const pannkakor = await post('/recipes', { title: 'Pannkakor', comment: 'Klassiska pannkakor, ca 12 st.', url: 'https://www.arla.se/recept/pannkakor/' })
  await post('/recipes', { title: 'Korvstroganoff', comment: 'Snabb vardagsrätt med ris.', url: '' })

  // Vecka 36 2026: mån 31/8 – sön 6/9
  await post('/meals', { title: 'Tacos', comment: 'Fredagsmys!', date: '2026-09-04', recipeIds: [tacos.recipe.id] })
  await post('/meals', { title: 'Ugnsbakad lax', date: '2026-09-02', recipeIds: [lax.recipe.id] })
  await post('/meals', { title: 'Pannkakor och ärtsoppa', comment: 'Torsdagsklassikern. Barnen vill ha sylt och grädde, vi andra kör lingon.', date: '2026-09-03', recipeIds: [pannkakor.recipe.id] })
  await post('/meals', { title: 'Köttbullar med potatismos', date: '2026-08-31', made: true, recipeIds: [] })
  await post('/meals', { title: 'Restdag – töm kylen', date: '2026-09-01', made: true, recipeIds: [] })

  console.log('PREVIEW_READY')
})
