"use client";

import { useState, useEffect, useMemo } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';
import { generateRecipesAction, type GenerateRecipesState } from '@/lib/actions';
import ImageUpload from '@/components/recipe/ImageUpload';
import RecipeList from '@/components/recipe/RecipeList';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Lightbulb, AlertCircle, Sparkles } from 'lucide-react';
import type { LocalSavedRecipe } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const initialState: GenerateRecipesState = {
  message: null,
  recipes: null,
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full md:w-auto shadow-md">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-5 w-5" /> Generate Recipes
        </>
      )}
    </Button>
  );
}

export default function RecipeGeneratorPage() {
  const [formState, formAction] = useFormState(generateRecipesAction, initialState);
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleImageUpload = (file: File, dataUri: string) => {
    setUploadedFile(file);
    setPhotoDataUri(dataUri);
  };

  // Display toasts for general messages/errors from formState
  useEffect(() => {
    if (formState?.timestamp) { // Check timestamp to only react to new state
      if (formState.message && formState.errors?.general) {
        toast({
          variant: "destructive",
          title: "Error",
          description: formState.message,
        });
      } else if (formState.message && formState.recipes && formState.recipes.length > 0) {
         toast({
          title: "Success!",
          description: formState.message,
        });
      } else if (formState.message) { // Other general messages (e.g. no recipes found)
         toast({
          title: "Notification",
          description: formState.message,
        });
      }
    }
  }, [formState, toast]);

  const recipesToDisplay: LocalSavedRecipe[] = useMemo(() => {
    if (formState?.recipes && photoDataUri) {
      return formState.recipes.map(name => ({ name, sourceImage: photoDataUri }));
    }
    return [];
  }, [formState?.recipes, photoDataUri]);


  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-card rounded-lg shadow-sm">
        <h1 className="text-3xl md:text-4xl font-headline font-bold mb-2 text-primary">Recipe Generator</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Upload a photo of your ingredients, and let AI suggest what you can cook!
        </p>
      </section>

      <form action={formAction} className="space-y-6">
        <ImageUpload 
          onImageUpload={handleImageUpload} 
          currentImagePreview={photoDataUri}
          disabled={useFormStatus().pending}
        />
        {photoDataUri && (
          <input type="hidden" name="photoDataUri" value={photoDataUri} />
        )}
        {formState?.errors?.photoDataUri && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Image Error</AlertTitle>
            <AlertDescription>{formState.errors.photoDataUri.join(', ')}</AlertDescription>
          </Alert>
        )}
        
        <div className="text-center">
          <SubmitButton />
        </div>
      </form>

      {useFormStatus().pending && !formState?.recipes && (
         <div className="text-center py-10">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">Analyzing ingredients and conjuring recipes...</p>
            <p className="text-sm text-muted-foreground">This might take a moment.</p>
        </div>
      )}

      {recipesToDisplay.length > 0 && (
        <section className="mt-12">
          <RecipeList recipes={recipesToDisplay} title="Here's what we cooked up!" />
        </section>
      )}

      {!useFormStatus().pending && formState?.recipes?.length === 0 && (
        <Alert className="mt-8">
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>No Recipes Found</AlertTitle>
          <AlertDescription>
            We couldn&apos;t find any recipes for the ingredients in the image. Try uploading a different photo with clearer ingredients or more variety.
          </AlertDescription>
        </Alert>
      )}
       {!useFormStatus().pending && !formState?.recipes && !formState?.errors && !photoDataUri && (
        <Alert variant="default" className="mt-8 bg-primary/10 border-primary/30">
            <Lightbulb className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary font-semibold">Ready to Cook?</AlertTitle>
            <AlertDescription className="text-primary/80">
                Upload an image of your ingredients to get started. The clearer the image, the better the suggestions!
            </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
