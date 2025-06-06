
"use client";

import { useState, useEffect, useMemo, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { analyzeIngredientsAction, type AnalyzeIngredientsState, generateRecipesFromIngredientsListAction, type GenerateRecipesState } from '@/lib/actions';
import ImageUpload from '@/components/recipe/ImageUpload';
import RecipeList from '@/components/recipe/RecipeList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  photoDataUriUsedInAnalysis: null,
};

const initialGenerateState: GenerateRecipesState = {
  message: null,
  recipes: null, // Will now be Array<{ name: string; description: string; }>
  errors: null,
  photoDataUriUsedForIdeas: null,
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
    setEditableIngredients([]); // Clear previous ingredients
    // currentStep will be determined by useEffect based on new photoDataUri and cleared states
  };

  // Centralized useEffect for determining currentStep
  useEffect(() => {
    if (!photoDataUri) {
      setCurrentStep('initial');
      return;
    }

    // Check if generateState is valid for the current photo
    if (generateState?.recipes && generateState.recipes.length > 0 && generateState.photoDataUriUsedForIdeas === photoDataUri) {
      setCurrentStep('showingRecipes');
    } 
    // Check if analyzeState is valid for the current photo
    else if (analyzeState?.ingredients && analyzeState.ingredients.length >= 0 && analyzeState.photoDataUriUsedInAnalysis === photoDataUri) {
      setCurrentStep('editingIngredients');
    } 
    // Default to initial if no valid state matches current photo or if analysis is pending
    else if (isAnalyzePending) {
      setCurrentStep('initial'); // Or a specific 'analyzing' step if desired
    }
    else {
      setCurrentStep('initial');
    }
  }, [photoDataUri, analyzeState, generateState, isAnalyzePending]);


  // Effect to update editableIngredients ONLY from NEW AI analysis results matching current photo
  useEffect(() => {
    if (analyzeState?.timestamp && analyzeState.photoDataUriUsedInAnalysis === photoDataUri) { 
      if (analyzeState.ingredients) {
        setEditableIngredients(analyzeState.ingredients);
      }
      // Toast logic for analysis completion
      if (analyzeState.errors) {
        const errorMsg = analyzeState.errors.general?.join(', ') || analyzeState.errors.photoDataUri?.join(', ') || 'Error analyzing image.';
        toast({ variant: "destructive", title: "Analysis Error", description: errorMsg });
      } else if (analyzeState.message) {
         toast({ title: (analyzeState.ingredients && analyzeState.ingredients.length > 0) ? "Analysis Complete" : "Notice", description: analyzeState.message });
      }
    }
  }, [analyzeState, photoDataUri, toast]); 

  // Effect for recipe generation toasts, only if for current photo
  useEffect(() => {
    if (generateState?.timestamp && generateState.photoDataUriUsedForIdeas === photoDataUri) { 
      if (generateState.errors) {
        const errorMsg = generateState.errors.general?.join(', ') || generateState.errors.ingredients?.join(', ') || 'Error generating recipe ideas.';
        toast({ variant: "destructive", title: "Recipe Idea Error", description: errorMsg });
      } else if (generateState.recipes && generateState.message) {
        toast({ title: "Recipe Ideas Ready!", description: generateState.message });
      }
    }
  }, [generateState, photoDataUri, toast]); 


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
    // Ensure we're in showingRecipes step and recipes are for the current photo
    if (currentStep === 'showingRecipes' && generateState?.recipes && photoDataUri && generateState.photoDataUriUsedForIdeas === photoDataUri) {
      return generateState.recipes.map(recipeIdea => ({ // recipeIdea is now { name: string; description: string; }
        name: recipeIdea.name,
        description: recipeIdea.description, // Pass the AI-generated description
        sourceImage: photoDataUri 
      }));
    }
    return [];
  }, [currentStep, generateState, photoDataUri]);

  const handleStartOver = () => {
    setPhotoDataUri(null);
    // analyzeState and generateState will be reset by their respective actions if new analysis is triggered.
    // currentStep will reset to 'initial' via useEffect when photoDataUri is null.
    setEditableIngredients([]);
    setNewIngredient("");
  };

  const handleRefineIngredients = () => {
    // This assumes analyzeState is still valid for the current photoDataUri
    // If analyzeState is not set or for a different photo, this might not work as expected
    // But the main useEffect for currentStep should handle this.
    if (photoDataUri && analyzeState?.photoDataUriUsedInAnalysis === photoDataUri && analyzeState.ingredients) {
      setEditableIngredients(analyzeState.ingredients); // Re-populate from analysis
      setCurrentStep('editingIngredients');
    } else if (photoDataUri) {
      // Fallback: if analyzeState is stale, but we have a photo, allow manual editing
      setCurrentStep('editingIngredients');
    } else {
      handleStartOver(); // No photo, just start over
    }
  };


  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-card rounded-lg shadow-sm">
        <h1 className="text-3xl md:text-4xl font-headline font-bold mb-2 text-primary">Recipe Idea Generator</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {currentStep === 'initial' && "Upload a photo of your ingredients."}
          {currentStep === 'editingIngredients' && "Check and change the ingredients list. Then, get recipe ideas!"}
          {currentStep === 'showingRecipes' && "Here are some recipe ideas for you!"}
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
          {analyzeState?.errors?.photoDataUri && analyzeState.photoDataUriUsedInAnalysis === photoDataUri && (
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Image Error</AlertTitle>
              <AlertDescription>{analyzeState.errors.photoDataUri.join(', ')}</AlertDescription>
            </Alert>
          )}
          {analyzeState?.errors?.general && analyzeState.photoDataUriUsedInAnalysis === photoDataUri && (
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
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
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
                  The AI might not always be perfect.
                </AlertDescription>
              </Alert>
            </div>
            
            {(editableIngredients.length > 0 || (analyzeState?.ingredients && analyzeState.ingredients.length === 0 && analyzeState.photoDataUriUsedInAnalysis === photoDataUri && !isAnalyzePending)) && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-foreground">Ingredients List:</h3>
                {editableIngredients.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background">
                    {editableIngredients.map((ingredient, index) => (
                      <Badge key={`${ingredient}-${index}`} variant="secondary" className="py-1.5 px-3 text-sm flex items-center gap-2 shadow-sm">
                        <span>{ingredient}</span>
                        <button 
                            type="button" 
                            onClick={() => handleRemoveIngredient(ingredient)} 
                            disabled={isGeneratePending} 
                            className="ml-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                            aria-label={`Remove ${ingredient}`}
                            >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                   <Alert variant="default">
                      <Lightbulb className="h-4 w-4" />
                      <AlertTitle>No Ingredients Listed</AlertTitle>
                      <AlertDescription>
                      The AI didn&apos;t find any ingredients, or they were removed. Add some yourself to get recipe ideas.
                      </AlertDescription>
                  </Alert>
                )}
              </div>
            )}


            <div className="flex gap-2 items-end pt-2">
              <div className="flex-grow space-y-1">
                <Label htmlFor="new-ingredient-input" className="text-sm font-medium">Add Ingredient</Label>
                <Input 
                  id="new-ingredient-input"
                  type="text" 
                  value={newIngredient} 
                  onChange={(e) => setNewIngredient(e.target.value)} 
                  placeholder="e.g., tomato, chicken"
                  className="flex-grow"
                  disabled={isGeneratePending}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddIngredient();}}}
                />
              </div>
              <Button onClick={handleAddIngredient} type="button" disabled={isGeneratePending || !newIngredient.trim()} className="shrink-0">
                <PlusCircle className="h-4 w-4"/> <span className="ml-1 sm:ml-2 hidden sm:inline">Add</span>
              </Button>
            </div>
            <form action={generateAction} className="space-y-4 pt-6 border-t">
              <input type="hidden" name="ingredients" value={editableIngredients.join(',')} />
              {photoDataUri && ( /* Pass the photoDataUri to associate with generated recipes */
                <input type="hidden" name="photoDataUriForRecipeSource" value={photoDataUri} />
              )}
               {generateState?.errors?.ingredients && generateState.photoDataUriUsedForIdeas === photoDataUri && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Ingredient Error</AlertTitle>
                  <AlertDescription>{generateState.errors.ingredients.join(', ')}</AlertDescription>
                </Alert>
              )}
              {generateState?.errors?.general && generateState.photoDataUriUsedForIdeas === photoDataUri && (
                 <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Recipe Idea Error</AlertTitle>
                  <AlertDescription>{generateState.errors.general.join(', ')}</AlertDescription>
                </Alert>
              )}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Button variant="outline" onClick={handleStartOver} disabled={isGeneratePending}>
                  Start Over (New Image)
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
            <p className="text-lg font-semibold text-muted-foreground">Whipping up recipe ideas...</p>
            <p className="text-sm text-muted-foreground">This can take a few seconds.</p>
        </div>
      )}

      {currentStep === 'showingRecipes' && recipesToDisplay.length > 0 && (
        <section>
          <RecipeList 
            recipes={recipesToDisplay} 
            title="Voila! Here are your recipe ideas:" 
            hideCardImage={false} // Show image for generated recipes
            ingredientsForCards={editableIngredients.join(',')}
          />
           <div className="text-center mt-8 space-y-3 sm:space-y-0 sm:space-x-4">
             <Button variant="outline" onClick={handleRefineIngredients}>
                <Pencil className="mr-2 h-4 w-4"/> Refine Ingredients
            </Button>
            <Button variant="default" onClick={handleStartOver}>
              Start New Search
            </Button>
          </div>
        </section>
      )}

      {currentStep === 'showingRecipes' && recipesToDisplay.length === 0 && !isGeneratePending && generateState?.photoDataUriUsedForIdeas === photoDataUri && (
        <Alert className="mt-8">
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>No Recipe Ideas This Time</AlertTitle>
          <AlertDescription>
            We couldn&apos;t find any recipe ideas with that list of ingredients. Try changing your ingredients or starting over with a new image.
          </AlertDescription>
           <div className="text-center mt-6 space-y-3 sm:space-y-0 sm:space-x-4">
             <Button variant="default" onClick={handleRefineIngredients}>
                <Pencil className="mr-2 h-4 w-4"/> Change Ingredient List
            </Button>
            <Button variant="outline" onClick={handleStartOver}>
              Try New Image
            </Button>
          </div>
        </Alert>
      )}
      
      {currentStep === 'initial' && !isAnalyzePending && !photoDataUri && (
        <Alert variant="default" className="mt-8 bg-primary/10 border-primary/30">
            <Lightbulb className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary font-semibold">How to Get Recipe Ideas:</AlertTitle>
            <AlertDescription className="text-primary/80 space-y-1">
                <p>Upload an image of your food items.</p>
                <p>Our AI will try to list the ingredients it sees.</p>
                <p>You can then add or remove ingredients from this list.</p>
                <p>Click "Get Recipe Ideas" for suggestions based on your final list!</p>
            </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
    

    
