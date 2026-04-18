import { Navigation } from "../components/Navigation";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Clock, Users, Upload, Plus, X, Save, ChevronDown } from "lucide-react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";

interface Option {
    id: number;
    name: string;
}

function Select({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: Option[];
    value: number | null;
    onChange: (id: number | null) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selected = options.find(o => o.id === value);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between border-2 border-orange-900/20 rounded-lg px-4 py-3 bg-white text-left focus:outline-none focus:border-orange-600 transition-colors"
            >
                <span className={selected ? 'text-orange-900' : 'text-orange-900/40'}>{selected?.name ?? label}</span>
                <ChevronDown className={`w-4 h-4 text-orange-900/40 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border-2 border-orange-900/20 rounded-xl shadow-lg overflow-hidden">
                    <div className="max-h-48 overflow-y-auto py-1">
                        {options.map(option => (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => { onChange(option.id); setOpen(false); }}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                    value === option.id
                                        ? 'bg-orange-50 text-orange-600 font-medium'
                                        : 'text-orange-900/70 hover:bg-orange-50 hover:text-orange-600'
                                }`}
                            >
                                {option.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CreateRecipe() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    const [name, setName] = useState("");
    const [prepTime, setPrepTime] = useState("");
    const [cookTime, setCookTime] = useState("");
    const [servings, setServings] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [cuisines, setCuisines] = useState<Option[]>([]);
    const [mealTypes, setMealTypes] = useState<Option[]>([]);
    const [allTags, setAllTags] = useState<Option[]>([]);
    const [selectedCuisine, setSelectedCuisine] = useState<number | null>(null);
    const [selectedMealType, setSelectedMealType] = useState<number | null>(null);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);

    const [ingredients, setIngredients] = useState<string[]>([]);
    const [newIngredient, setNewIngredient] = useState("");
    const [editingIngredient, setEditingIngredient] = useState<number | null>(null);
    const [editIngredientValue, setEditIngredientValue] = useState("");

    const [directions, setDirections] = useState<string[]>([]);
    const [newDirection, setNewDirection] = useState("");
    const [editingDirection, setEditingDirection] = useState<number | null>(null);
    const [editDirectionValue, setEditDirectionValue] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoggedIn) { navigate('/login', { replace: true }); return; }
        api.get('/reference/cuisines').then(setCuisines);
        api.get('/reference/meal-types').then(setMealTypes);
        api.get('/reference/tags').then(setAllTags);
    }, [isLoggedIn]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const toggleTag = (id: number) => {
        setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    };

    const addIngredient = () => {
        if (newIngredient.trim()) {
            setIngredients([...ingredients, newIngredient.trim()]);
            setNewIngredient("");
        }
    };

    const saveIngredient = (index: number) => {
        const updated = [...ingredients];
        updated[index] = editIngredientValue;
        setIngredients(updated);
        setEditingIngredient(null);
    };

    const addDirection = () => {
        if (newDirection.trim()) {
            setDirections([...directions, newDirection.trim()]);
            setNewDirection("");
        }
    };

    const saveDirection = (index: number) => {
        const updated = [...directions];
        updated[index] = editDirectionValue;
        setDirections(updated);
        setEditingDirection(null);
    };

    const handleSubmit = async () => {
        setError(null);
        if (!name.trim()) { setError('Recipe name is required.'); return; }
        if (!selectedCuisine) { setError('Please select a cuisine.'); return; }
        if (!selectedMealType) { setError('Please select a meal type.'); return; }
        if (ingredients.length === 0) { setError('Add at least one ingredient.'); return; }
        if (directions.length === 0) { setError('Add at least one direction.'); return; }

        setSubmitting(true);
        try {
            let image_url = '';
            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);
                const uploadResult = await api.upload('/upload', formData);
                image_url = uploadResult.image_url ?? '';
            }

            const body = {
                name: name.trim(),
                description: description.trim(),
                image_url,
                cook_time: parseInt(cookTime) || 0,
                prep_time: parseInt(prepTime) || 0,
                servings: parseInt(servings) || 1,
                cuisine_id: selectedCuisine,
                meal_type_id: selectedMealType,
                tag_ids: selectedTags,
                ingredients,
                instructions: directions,
            };

            const result = await api.post('/recipes', body, true);
            if (result.recipeId) {
                navigate(`/recipe/${result.recipeId}`);
            } else {
                setError(result.message ?? 'Failed to create recipe.');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f1e8]">
            <Navigation />

            <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="border-2 border-orange-900/20 rounded-3xl p-8 md:p-12 bg-white">
                    <h1 className="text-4xl text-orange-900 mb-8 text-center">Create New Recipe</h1>

                    {error && (
                        <div className="mb-6 px-4 py-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Recipe Name */}
                    <div className="mb-6">
                        <label className="block text-orange-900 mb-2">Recipe Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Enter recipe name..."
                            className="w-full border-2 border-orange-900/20 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-600 transition-colors"
                        />
                    </div>

                    {/* Cuisine & Meal Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-orange-900 mb-2">Cuisine</label>
                            <Select label="Select cuisine..." options={cuisines} value={selectedCuisine} onChange={setSelectedCuisine} />
                        </div>
                        <div>
                            <label className="block text-orange-900 mb-2">Meal Type</label>
                            <Select label="Select meal type..." options={mealTypes} value={selectedMealType} onChange={setSelectedMealType} />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="mb-6">
                        <label className="block text-orange-900 mb-2">Recipe Image</label>
                        <div
                            className="border-2 border-dashed border-orange-900/20 rounded-2xl overflow-hidden bg-orange-50 hover:border-orange-600 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
                            ) : (
                                <div className="w-full h-64 flex flex-col items-center justify-center text-orange-900/40">
                                    <Upload className="w-12 h-12 mb-3" />
                                    <p>Click to upload image</p>
                                    <p className="text-sm mt-1">JPG, PNG, WEBP</p>
                                </div>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </div>

                    {/* Times & Servings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-orange-900 mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Prep Time (min)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={prepTime}
                                onChange={e => setPrepTime(e.target.value)}
                                className="w-full border-2 border-orange-900/20 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-600 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-orange-900 mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Cook Time (min)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={cookTime}
                                onChange={e => setCookTime(e.target.value)}
                                className="w-full border-2 border-orange-900/20 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-600 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-orange-900 mb-2 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Servings
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={servings}
                                onChange={e => setServings(e.target.value)}
                                className="w-full border-2 border-orange-900/20 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-600 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-orange-900 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Tell us about this recipe..."
                            rows={3}
                            className="w-full border-2 border-orange-900/20 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-600 transition-colors resize-none"
                        />
                    </div>

                    {/* Dietary Tags */}
                    {allTags.length > 0 && (
                        <div className="mb-8">
                            <label className="block text-orange-900 mb-2">Dietary Tags</label>
                            <div className="flex flex-wrap gap-2">
                                {allTags.map(tag => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => toggleTag(tag.id)}
                                        className={`px-3 py-1 rounded-full border-2 text-sm transition-all ${
                                            selectedTags.includes(tag.id)
                                                ? 'bg-orange-600 border-orange-600 text-white'
                                                : 'bg-white border-orange-900/20 text-orange-900/70 hover:border-orange-600 hover:text-orange-600'
                                        }`}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ingredients */}
                    <div className="mb-8">
                        <h2 className="text-2xl text-orange-900 mb-4">Ingredients</h2>
                        <div className="space-y-2 mb-4">
                            {ingredients.map((ingredient, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="text-orange-600 text-lg leading-none">•</span>
                                    {editingIngredient === index ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editIngredientValue}
                                                onChange={e => setEditIngredientValue(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && saveIngredient(index)}
                                                className="flex-1 border-2 border-orange-900/20 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-600"
                                                autoFocus
                                            />
                                            <button onClick={() => saveIngredient(index)} className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">Save</button>
                                            <button onClick={() => setEditingIngredient(null)} className="border-2 border-orange-900/20 text-orange-900/60 px-3 py-2 rounded-lg text-sm hover:border-orange-600 transition-colors">Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <span
                                                className="flex-1 text-orange-900/80 cursor-pointer hover:text-orange-600 transition-colors"
                                                onClick={() => { setEditingIngredient(index); setEditIngredientValue(ingredient); }}
                                            >
                                                {ingredient}
                                            </span>
                                            <button onClick={() => setIngredients(ingredients.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-600 p-1">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newIngredient}
                                onChange={e => setNewIngredient(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addIngredient()}
                                placeholder="Add ingredient..."
                                className="flex-1 border-2 border-orange-900/20 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-600 transition-colors"
                            />
                            <button onClick={addIngredient} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                                <Plus className="w-4 h-4" /> Add
                            </button>
                        </div>
                    </div>

                    {/* Directions */}
                    <div className="mb-8">
                        <h2 className="text-2xl text-orange-900 mb-4">Directions</h2>
                        <div className="space-y-3 mb-4">
                            {directions.map((direction, index) => (
                                <div key={index} className="flex gap-3 items-start">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white text-sm mt-1">
                                        {index + 1}
                                    </span>
                                    {editingDirection === index ? (
                                        <div className="flex-1 flex flex-col gap-2">
                                            <textarea
                                                value={editDirectionValue}
                                                onChange={e => setEditDirectionValue(e.target.value)}
                                                rows={2}
                                                className="w-full border-2 border-orange-900/20 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-600 resize-none"
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => saveDirection(index)} className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-lg text-sm transition-colors">Save</button>
                                                <button onClick={() => setEditingDirection(null)} className="border-2 border-orange-900/20 text-orange-900/60 px-3 py-1 rounded-lg text-sm hover:border-orange-600 transition-colors">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p
                                                className="flex-1 text-orange-900/80 cursor-pointer hover:text-orange-600 transition-colors pt-1"
                                                onClick={() => { setEditingDirection(index); setEditDirectionValue(direction); }}
                                            >
                                                {direction}
                                            </p>
                                            <button onClick={() => setDirections(directions.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-600 p-1 mt-1">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 items-start">
                            <textarea
                                value={newDirection}
                                onChange={e => setNewDirection(e.target.value)}
                                placeholder="Add step..."
                                rows={2}
                                className="flex-1 border-2 border-orange-900/20 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-600 transition-colors resize-none"
                            />
                            <button onClick={addDirection} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                                <Plus className="w-4 h-4" /> Add
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg flex items-center gap-2 transition-colors text-lg"
                        >
                            <Save className="w-5 h-5" />
                            {submitting ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
