
"use client";

import { useState, useEffect, useMemo, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { analyzeIngredientsAction, type AnalyzeIngredientsState, generateRecipesFromIngredientsListAction, type GenerateRecipesState } from '@/lib/actions';
import ImageUpload from '@/components/recipe/ImageUpload';
import RecipeList from '@/components/recipe/RecipeList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Lightbulb, AlertCircle, Sparkles, Pencil, Trash2, PlusCircle, ChefHat } from 'lucide-react';
import type { LocalSavedRecipe } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const initialAnalyzeState: AnalyzeIngredientsState = {
  message: null,
  ingredients: null,
  errors: null,
};

const initialGenerateState: GenerateRecipesState = {
  message: null,
  recipes: null,
  errors: null,
};

function AnalyzeIngredientsSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full md:w-auto shadow-md">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-5 w-5" /> Analyze Ingredients
        </>
      )}
    </Button>
  );
}

function GenerateRecipesSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full md:w-auto shadow-md bg-primary hover:bg-primary/90 text-primary-foreground">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Recipes...
        </>
      ) : (
        <>
          <ChefHat className="mr-2 h-5 w-5" /> Generate Recipes from List
        </>
      )}
    </Button>
  );
}

export default function RecipeGeneratorPage() {
  const [analyzeState, analyzeAction, isAnalyzePending] = useActionState(analyzeIngredientsAction, initialAnalyzeState);
  const [generateState, generateAction, isGeneratePending] = useActionState(generateRecipesFromIngredientsListAction, initialGenerateState);

  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'initial' | 'editingIngredients' | 'showingRecipes'>('initial');
  
  const [editableIngredients, setEditableIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState<string>("");

  const { toast } = useToast();

  const handleImageUpload = (file: File, dataUri: string) => {
    setPhotoDataUri(dataUri);
    setCurrentStep('initial'); 
    setEditableIngredients([]); 
    // Resetting form states by effectively re-initializing them or relying on their internal reset.
    // For useActionState, the pending status will reset, and new actions will get new state.
  };

  useEffect(() => {
    if (analyzeState?.timestamp) {
      if (analyzeState.errors) {
        const errorMsg = analyzeState.errors.general?.join(', ') || analyzeState.errors.photoDataUri?.join(', ') || 'Error analyzing image.';
        toast({ variant: "destructive", title: "Analysis Error", description: errorMsg });
      } else if (analyzeState.ingredients) {
        setEditableIngredients(analyzeState.ingredients);
        setCurrentStep('editingIngredients');
        if (analyzeState.message && analyzeState.ingredients.length > 0) {
           toast({ title: "Analysis Complete", description: analyzeState.message });
        } else if (analyzeState.message) {
           toast({ title: "Notice", description: analyzeState.message });
        }
      }
    }
  }, [analyzeState, toast]);

  useEffect(() => {
    if (generateState?.timestamp) {
      if (generateState.errors) {
        const errorMsg = generateState.errors.general?.join(', ') || generateState.errors.ingredients?.join(', ') || 'Error generating recipes.';
        toast({ variant: "destructive", title: "Recipe Generation Error", description: errorMsg });
      } else if (generateState.recipes) {
        setCurrentStep('showingRecipes');
        if (generateState.message) {
          toast({ title: "Recipes Generated!", description: generateState.message });
        }
      }
    }
  }, [generateState, toast]);

  const handleAddIngredient = () => {
    if (newIngredient.trim() && !editableIngredients.includes(newIngredient.trim().toLowerCase())) {
      setEditableIngredients([...editableIngredients, newIngredient.trim().toLowerCase()]);
      setNewIngredient("");
    } else if (newIngredient.trim()) {
        toast({variant: "default", title: "Duplicate Ingredient", description: `${newIngredient.trim()} is already in the list.`});
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setEditableIngredients(editableIngredients.filter(ing => ing !== ingredientToRemove));
  };

  const recipesToDisplay: LocalSavedRecipe[] = useMemo(() => {
    if (currentStep === 'showingRecipes' && generateState?.recipes && photoDataUri) {
      return generateState.recipes.map(name => ({ name, sourceImage: photoDataUri }));
    }
    return [];
  }, [currentStep, generateState?.recipes, photoDataUri]);


  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-card rounded-lg shadow-sm">
        <h1 className="text-3xl md:text-4xl font-headline font-bold mb-2 text-primary">Recipe Generator</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {currentStep === 'initial' && "Upload a photo of your ingredients to get started."}
          {currentStep === 'editingIngredients' && "Review and edit the identified ingredients, then generate recipes."}
          {currentStep === 'showingRecipes' && "Here are your personalized recipe suggestions!"}
        </p>
      </section>

      {currentStep === 'initial' && (
        <form action={analyzeAction} className="space-y-6">
          <ImageUpload 
            onImageUpload={handleImageUpload} 
            currentImagePreview={photoDataUri}
            disabled={isAnalyzePending}
          />
          {photoDataUri && (
            <input type="hidden" name="photoDataUri" value={photoDataUri} />
          )}
          {analyzeState?.errors?.photoDataUri && (
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Image Error</AlertTitle>
              <AlertDescription>{analyzeState.errors.photoDataUri.join(', ')}</AlertDescription>
            </Alert>
          )}
          {analyzeState?.errors?.general && (
             <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Analysis Error</AlertTitle>
              <AlertDescription>{analyzeState.errors.general.join(', ')}</AlertDescription>
            </Alert>
          )}
          <div className="text-center">
            <AnalyzeIngredientsSubmitButton />
          </div>
        </form>
      )}
      
      {isAnalyzePending && currentStep === 'initial' && (
         <div className="text-center py-10">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">Analyzing ingredients...</p>
            <p className="text-sm text-muted-foreground">This might take a moment.</p>
        </div>
      )}

      {currentStep === 'editingIngredients' && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-headline">
              <Pencil className="h-6 w-6 text-primary"/> Review & Edit Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {photoDataUri && (
                <Image 
                  src={photoDataUri} 
                  alt="Uploaded ingredients" 
                  width={150} 
                  height={112} 
                  className="rounded-md shadow-sm border object-cover aspect-[4/3]"
                  data-ai-hint="food ingredients"
                />
              )}
              <Alert className="flex-grow">
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Refine Your List</AlertTitle>
                <AlertDescription>
                  Add or remove ingredients below to get the best recipe suggestions.
                </AlertDescription>
              </Alert>
            </div>
            
            {editableIngredients.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-foreground">Identified Ingredients:</h3>
                <div className="flex flex-wrap gap-2">
                  {editableIngredients.map((ingredient, index) => (
                    <Badge key={index} variant="secondary" className="py-1 px-3 text-sm flex items-center gap-2">
                      <span>{ingredient}</span>
                      <button type="button" onClick={() => handleRemoveIngredient(ingredient)} disabled={isGeneratePending} className="ml-1 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
             {editableIngredients.length === 0 && !isAnalyzePending && (
                 <Alert variant="default">
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>No Ingredients Yet</AlertTitle>
                    <AlertDescription>
                    The AI didn&apos;t find any ingredients, or you&apos;ve removed them. Add some manually below to generate recipes.
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex gap-2 items-end">
              <div className="flex-grow space-y-1">
                <label htmlFor="new-ingredient-input" className="text-sm font-medium text-muted-foreground">Add Ingredient</label>
                <Input 
                  id="new-ingredient-input"
                  type="text" 
                  value={newIngredient} 
                  onChange={(e) => setNewIngredient(e.target.value)} 
                  placeholder="e.g., 'tomato', 'chicken breast'"
                  className="flex-grow"
                  disabled={isGeneratePending}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddIngredient();}}}
                />
              </div>
              <Button onClick={handleAddIngredient} type="button" disabled={isGeneratePending || !newIngredient.trim()} className="shrink-0">
                <PlusCircle className="h-4 w-4"/> <span className="ml-2 hidden sm:inline">Add</span>
              </Button>
            </div>
            <form action={generateAction} className="space-y-4 pt-4 border-t">
              <input type="hidden" name="ingredients" value={editableIngredients.join(',')} />
               {generateState?.errors?.ingredients && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Ingredient Error</AlertTitle>
                  <AlertDescription>{generateState.errors.ingredients.join(', ')}</AlertDescription>
                </Alert>
              )}
              {generateState?.errors?.general && (
                 <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Generation Error</AlertTitle>
                  <AlertDescription>{generateState.errors.general.join(', ')}</AlertDescription>
                </Alert>
              )}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Button variant="outline" onClick={() => { setCurrentStep('initial'); setPhotoDataUri(null); setEditableIngredients([]); }} disabled={isGeneratePending}>
                  Start Over
                </Button>
                <GenerateRecipesSubmitButton />
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isGeneratePending && currentStep === 'editingIngredients' && (
        <div className="text-center py-10">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">Crafting recipes from your custom list...</p>
        </div>
      )}


      {currentStep === 'showingRecipes' && recipesToDisplay.length > 0 && (
        <section>
          <RecipeList recipes={recipesToDisplay} title="Here's what we cooked up for you!" />
           <div className="text-center mt-8 space-x-4">
             <Button variant="outline" onClick={() => setCurrentStep('editingIngredients')}>
                <Pencil className="mr-2 h-4 w-4"/> Refine Ingredients
            </Button>
            <Button variant="default" onClick={() => { setCurrentStep('initial'); setPhotoDataUri(null); setEditableIngredients([]); }}>
              Start New Search
            </Button>
          </div>
        </section>
      )}

      {currentStep === 'showingRecipes' && recipesToDisplay.length === 0 && !isGeneratePending && (
        <Alert className="mt-8">
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>No Recipes Found This Time</AlertTitle>
          <AlertDescription>
            We couldn&apos;t conjure any recipes with that specific set of ingredients. Why not try tweaking your list?
          </AlertDescription>
           <div className="text-center mt-6 space-x-4">
             <Button variant="default" onClick={() => setCurrentStep('editingIngredients')}>
                <Pencil className="mr-2 h-4 w-4"/> Edit Ingredient List
            </Button>
            <Button variant="outline" onClick={() => { setCurrentStep('initial'); setPhotoDataUri(null); setEditableIngredients([]); }}>
              Try New Image
            </Button>
          </div>
        </Alert>
      )}
      
      {currentStep === 'initial' && !isAnalyzePending && !photoDataUri && (
        <Alert variant="default" className="mt-8 bg-primary/10 border-primary/30">
            <Lightbulb className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary font-semibold">Ready for Culinary Inspiration?</AlertTitle>
            <AlertDescription className="text-primary/80">
                1. Upload an image of your ingredients.
                2. The AI will list what it sees.
                3. You can edit this list.
                4. Get recipe ideas based on your final list!
            </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
