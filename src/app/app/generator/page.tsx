
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
import { Label } from '@/components/ui/label'; // Added import

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
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Getting Recipe Ideas...
        </>
      ) : (
        <>
          <ChefHat className="mr-2 h-5 w-5" /> Get Recipe Ideas
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
    // Resetting generateState if a new image is uploaded is implicitly handled
    // because new ingredients will lead to a new generateAction call.
  };

  // Effect to handle state changes from ingredient analysis
  useEffect(() => {
    if (analyzeState?.timestamp) { // A new analysis action has completed
      if (analyzeState.errors) {
        const errorMsg = analyzeState.errors.general?.join(', ') || analyzeState.errors.photoDataUri?.join(', ') || 'Error analyzing image.';
        toast({ variant: "destructive", title: "Analysis Error", description: errorMsg });
      } else if (analyzeState.ingredients) {
        // Sync editableIngredients with fresh AI results from a new analysis
        setEditableIngredients(analyzeState.ingredients);
        // Toast for completion
        if (analyzeState.message && analyzeState.ingredients.length > 0) {
           toast({ title: "Analysis Complete", description: analyzeState.message });
        } else if (analyzeState.message) { // e.g. no ingredients found
           toast({ title: "Notice", description: analyzeState.message });
        }
      }
    }

    // Determine current UI step based on overall state (handles back navigation)
    // If ingredients are analyzed, photo context exists, and recipes are not yet shown
    if (photoDataUri && analyzeState?.ingredients && (!generateState?.recipes || generateState.recipes.length === 0)) {
      setCurrentStep('editingIngredients');
       // Ensure editableIngredients is synced if analyzeState has data but local state is empty (e.g., on back nav)
       if (editableIngredients.length === 0 && analyzeState.ingredients.length > 0) {
        setEditableIngredients(analyzeState.ingredients);
      }
    }
  }, [analyzeState, photoDataUri, generateState?.recipes, toast, editableIngredients]); // Added editableIngredients to ensure it's up-to-date for comparison

  // Effect to handle state changes from recipe generation
  useEffect(() => {
    if (generateState?.timestamp) { // A new recipe generation action has completed
      if (generateState.errors) {
        const errorMsg = generateState.errors.general?.join(', ') || generateState.errors.ingredients?.join(', ') || 'Error generating recipe ideas.';
        toast({ variant: "destructive", title: "Recipe Idea Error", description: errorMsg });
      } else if (generateState.recipes) {
        // Toast for completion
        if (generateState.message) {
          toast({ title: "Recipe Ideas Ready!", description: generateState.message });
        }
      }
    }
    
    // Determine current UI step based on overall state (handles back navigation)
    // If recipes are generated and photo context exists
    if (generateState?.recipes && photoDataUri) {
      setCurrentStep('showingRecipes');
    }
  }, [generateState, photoDataUri, toast]);

  // Effect to handle returning to initial state if photo is cleared
  useEffect(() => {
    if (!photoDataUri) {
      setCurrentStep('initial');
      setEditableIngredients([]); // Clear ingredients if going back to the very start
      // Note: generateState is not explicitly reset here; new ingredient analysis will lead to new recipes.
    }
  }, [photoDataUri]);


  const handleAddIngredient = () => {
    if (newIngredient.trim() && !editableIngredients.map(ing => ing.toLowerCase()).includes(newIngredient.trim().toLowerCase())) {
      setEditableIngredients([...editableIngredients, newIngredient.trim()]);
      setNewIngredient("");
    } else if (newIngredient.trim()) {
        toast({variant: "default", title: "Duplicate Ingredient", description: `${newIngredient.trim()} is already in the list.`});
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setEditableIngredients(editableIngredients.filter(ing => ing.toLowerCase() !== ingredientToRemove.toLowerCase()));
  };

  const recipesToDisplay: LocalSavedRecipe[] = useMemo(() => {
    if (currentStep === 'showingRecipes' && generateState?.recipes && photoDataUri) {
      return generateState.recipes.map(name => ({ 
        name, 
        sourceImage: photoDataUri
      }));
    }
    return [];
  }, [currentStep, generateState?.recipes, photoDataUri]);


  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-card rounded-lg shadow-sm">
        <h1 className="text-3xl md:text-4xl font-headline font-bold mb-2 text-primary">Recipe Idea Generator</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {currentStep === 'initial' && "1. Upload a photo of your ingredients."}
          {currentStep === 'editingIngredients' && "2. Check and change the ingredients list. Then, get recipe ideas!"}
          {currentStep === 'showingRecipes' && "3. Here are some recipe ideas for you!"}
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
            <p className="text-lg font-semibold text-muted-foreground">Looking at your ingredients...</p>
            <p className="text-sm text-muted-foreground">This might take a moment.</p>
        </div>
      )}

      {currentStep === 'editingIngredients' && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-headline">
              <Pencil className="h-6 w-6 text-primary"/> Check Your Ingredients
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
                <AlertTitle>Make the List Perfect!</AlertTitle>
                <AlertDescription>
                  Add or remove ingredients below to get the best recipe ideas.
                </AlertDescription>
              </Alert>
            </div>
            
            {editableIngredients.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-foreground">Ingredients Found/Edited:</h3>
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
             {editableIngredients.length === 0 && photoDataUri && !isAnalyzePending && ( 
                 <Alert variant="default">
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>No Ingredients Listed</AlertTitle>
                    <AlertDescription>
                    The AI didn&apos;t find any ingredients, or you removed them. Add some yourself to get recipe ideas.
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex gap-2 items-end">
              <div className="flex-grow space-y-1">
                <Label htmlFor="new-ingredient-input" className="text-sm font-medium text-muted-foreground">Add Ingredient (e.g., tomato, chicken)</Label>
                <Input 
                  id="new-ingredient-input"
                  type="text" 
                  value={newIngredient} 
                  onChange={(e) => setNewIngredient(e.target.value)} 
                  placeholder="Type ingredient and press Add"
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
                  <AlertTitle>Recipe Idea Error</AlertTitle>
                  <AlertDescription>{generateState.errors.general.join(', ')}</AlertDescription>
                </Alert>
              )}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Button variant="outline" onClick={() => { setPhotoDataUri(null); /* useEffect will handle currentStep and editableIngredients */ }} disabled={isGeneratePending}>
                  Start Over with New Image
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
            <p className="text-lg font-semibold text-muted-foreground">Getting recipe ideas for you...</p>
        </div>
      )}

      {currentStep === 'showingRecipes' && recipesToDisplay.length > 0 && (
        <section>
          <RecipeList 
            recipes={recipesToDisplay} 
            title="Here are some recipe ideas!" 
            hideCardImage={false} 
            ingredientsForCards={editableIngredients.join(',')}
          />
           <div className="text-center mt-8 space-x-4">
             <Button variant="outline" onClick={() => setCurrentStep('editingIngredients')}>
                <Pencil className="mr-2 h-4 w-4"/> Change Ingredients
            </Button>
            <Button variant="default" onClick={() => { setPhotoDataUri(null); /* useEffect will handle currentStep and editableIngredients */ }}>
              Start New Search (New Image)
            </Button>
          </div>
        </section>
      )}

      {currentStep === 'showingRecipes' && recipesToDisplay.length === 0 && !isGeneratePending && (
        <Alert className="mt-8">
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>No Recipe Ideas This Time</AlertTitle>
          <AlertDescription>
            We couldn&apos;t find any recipe ideas with that list of ingredients. Try changing your ingredients?
          </AlertDescription>
           <div className="text-center mt-6 space-x-4">
             <Button variant="default" onClick={() => setCurrentStep('editingIngredients')}>
                <Pencil className="mr-2 h-4 w-4"/> Change Ingredient List
            </Button>
            <Button variant="outline" onClick={() => { setPhotoDataUri(null); /* useEffect will handle currentStep and editableIngredients */ }}>
              Try New Image
            </Button>
          </div>
        </Alert>
      )}
      
      {currentStep === 'initial' && !isAnalyzePending && !photoDataUri && (
        <Alert variant="default" className="mt-8 bg-primary/10 border-primary/30">
            <Lightbulb className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary font-semibold">How to get recipe ideas:</AlertTitle>
            <AlertDescription className="text-primary/80">
                1. Upload an image of your ingredients (food items).
                2. The AI will try to list the ingredients it sees.
                3. You can add or remove ingredients from this list.
                4. Click "Get Recipe Ideas" to see suggestions based on your final list!
            </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

    