import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { createItemAPI } from "../api/items"
import SiteNav from "../components/SiteNav"
import { ErrorMessage } from "../components/PageStates"

const MAX_IMAGES = 6
const MAX_SIZE = 5 * 1024 * 1024
const acceptedTypes = ["image/jpeg", "image/png", "image/webp"]

function ListItemPage() {
  const [form, setForm] = useState({ title: "", description: "", category: "Electronics", type: "borrow", price: "", per: "day", hostel: "", rules: "" })
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  useEffect(() => () => images.forEach((image) => URL.revokeObjectURL(image.preview)), [images])
  const addImages = (event) => {
    const selected = Array.from(event.target.files || [])
    const invalid = selected.find((file) => !acceptedTypes.includes(file.type) || file.size > MAX_SIZE)
    if (invalid) { setError("Use JPEG, PNG, or WebP images under 5 MB each."); event.target.value = ""; return }
    if (images.length + selected.length > MAX_IMAGES) { setError(`You can upload up to ${MAX_IMAGES} images.`); event.target.value = ""; return }
    setError("")
    setImages([...images, ...selected.map((file) => ({ file, preview: URL.createObjectURL(file) }))])
    event.target.value = ""
  }
  const removeImage = (index) => { URL.revokeObjectURL(images[index].preview); setImages(images.filter((_, imageIndex) => imageIndex !== index)) }
  const submit = async (e) => {
    e.preventDefault(); setError("")
    if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0) return setError("Enter a price greater than zero.")
    try {
      setLoading(true)
      const payload = new FormData()
      Object.entries(form).forEach(([key, value]) => payload.append(key, key === "rules" ? JSON.stringify(value.split("\n").filter(Boolean)) : value))
      images.forEach(({ file }) => payload.append("images", file))
      await createItemAPI(payload); navigate("/listings")
    } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }
  return <div className="page-shell"><SiteNav /><main className="container-wide py-12 lg:py-16"><div className="max-w-2xl"><p className="eyebrow">Put it to work</p><h1 className="font-display mt-4 text-6xl leading-none">List an item.</h1><p className="mt-5 text-[#687087]">Show people what you have. Clear photos make easy exchanges.</p></div><form onSubmit={submit} className="mt-10 max-w-4xl border-t border-[#17213d]">{error && <div className="mt-6"><ErrorMessage message={error} /></div>}<div className="grid gap-6 border-b hairline py-8 sm:grid-cols-2"><div className="sm:col-span-2"><label className="field-label" htmlFor="title">What are you sharing?</label><input id="title" name="title" className="field-control" placeholder="Scientific calculator, acoustic guitar..." value={form.title} onChange={update} required /></div><div className="sm:col-span-2"><label className="field-label" htmlFor="description">Describe it</label><textarea id="description" name="description" className="field-control min-h-28" placeholder="Condition, brand, what’s included..." value={form.description} onChange={update} required /></div><div><label className="field-label" htmlFor="category">Category</label><select id="category" name="category" className="field-control" value={form.category} onChange={update}>{["Electronics", "Books", "Instruments", "Sports", "Food", "Clothes", "Other"].map((item) => <option key={item}>{item}</option>)}</select></div><div><label className="field-label" htmlFor="type">Exchange type</label><select id="type" name="type" className="field-control" value={form.type} onChange={update}><option value="borrow">Borrow / rent</option><option value="sell">For sale (informational)</option></select></div></div><div className="border-b hairline py-8"><div className="flex items-end justify-between gap-4"><div><label className="field-label mb-1" htmlFor="images">Product photos</label><p className="text-xs text-[#687087]">JPEG, PNG or WebP · up to 5 MB each · {images.length}/{MAX_IMAGES}</p></div><label htmlFor="images" className="btn-outline cursor-pointer">Add photos</label><input id="images" type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={addImages} /></div>{images.length > 0 && <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{images.map((image, index) => <div key={image.preview} className="group relative aspect-square overflow-hidden border border-[#d8d5cf] bg-[#ece6dc]"><img src={image.preview} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" /><button type="button" onClick={() => removeImage(index)} className="absolute right-2 top-2 bg-[#17213d] px-2 py-1 text-xs text-[#fffdf9] opacity-0 transition-opacity group-hover:opacity-100">Remove</button></div>)}</div>}</div><div className="grid gap-6 border-b hairline py-8 sm:grid-cols-2"><div><label className="field-label" htmlFor="price">Price (₹)</label><input id="price" name="price" type="number" min="0.01" step="0.01" className="field-control" value={form.price} onChange={update} required /></div><div><label className="field-label" htmlFor="per">Price applies</label><select id="per" name="per" className="field-control" value={form.per} onChange={update}><option value="day">Per day</option><option value="hour">Per hour</option><option value="flat">Flat price</option></select></div><div><label className="field-label" htmlFor="hostel">Where can people find it?</label><input id="hostel" name="hostel" className="field-control" placeholder="Hostel / block" value={form.hostel} onChange={update} /></div><div><label className="field-label" htmlFor="rules">Rules <span className="font-normal text-[#687087]">(optional)</span></label><textarea id="rules" name="rules" className="field-control" placeholder="One rule per line" value={form.rules} onChange={update} /></div></div><div className="flex items-center justify-between gap-4 py-8"><p className="text-xs text-[#687087]">No payment is processed by Borrow My Stuff.</p><button className="btn-quiet" disabled={loading}>{loading ? "Publishing..." : "Publish listing ↗"}</button></div></form></main></div>
}

export default ListItemPage
