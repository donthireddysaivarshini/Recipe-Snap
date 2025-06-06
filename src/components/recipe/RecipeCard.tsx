
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Users, Image as ImageIcon } from 'lucide-react';
import type { LocalSavedRecipe } from '@/lib/types';
import { slugify } from '@/lib/utils';

interface RecipeCardProps {
  recipe: LocalSavedRecipe; // Contains name and sourceImage (user-uploaded)
  isLink?: boolean;
  hideImage?: boolean;
  ingredientsForLink?: string; // Comma-separated string of ingredients
}

export default function RecipeCard({ recipe, isLink = true, hideImage = false, ingredientsForLink }: RecipeCardProps) {
  const slug = slugify(recipe.name);
  const isDataUri = recipe.sourceImage && recipe.sourceImage.startsWith('data:image/');
  const imageHint = isDataUri ? "food ingredients" : "recipe photo";

  const handleClick = (e: React.MouseEvent) => {
    if (isDataUri && typeof window !== 'undefined' && window.sessionStorage) {
      try {
        // Store the user-uploaded image for the detail page
        sessionStorage.setItem(`tempImage_${slug}`, recipe.sourceImage!);
      } catch (err) {
        console.warn("Session storage not available for temp image.", err);
      }
    }
  };

  let href = `/app/recipe/${slug}?name=${encodeURIComponent(recipe.name)}`;
  if (isDataUri) {
    href += `&tempImageKey=${slug}`; // Key to retrieve data URI from session storage
  } else if (recipe.sourceImage) {
    // If sourceImage is a regular URL (less likely for user uploads now, but for completeness)
    href += `&image=${encodeURIComponent(recipe.sourceImage)}`;
  }
  if (ingredientsForLink) {
    href += `&ingredients=${encodeURIComponent(ingredientsForLink)}`;
  }


  const cardContent = (
    <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {!hideImage && (
        <CardHeader className="p-0">
          <div className="aspect-[4/3] relative w-full overflow-hidden group">
            {recipe.sourceImage ? ( // This sourceImage is the user-uploaded one
              <Image
                src={recipe.sourceImage}
                alt={`Ingredients for ${recipe.name}`}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={imageHint}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <ImageIcon size={48} className="text-muted-foreground" />
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={`p-4 flex-grow ${hideImage ? 'pt-6' : ''}`}>
        <CardTitle className="font-headline text-xl mb-2 line-clamp-2">{recipe.name}</CardTitle>
        <CardDescription className="text-sm line-clamp-3 text-muted-foreground">
          A simple recipe suggestion. Click to see easy instructions.
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <div className="flex justify-between items-center w-full text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>~30-45 min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>2-3 servings</span>
          </div>
          {isLink && (
            <Button variant="link" size="sm" className="p-0 h-auto text-primary group-hover:underline">
              View Recipe <ArrowRight size={16} className="ml-1" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );

  if (isLink) {
    return (
      <Link href={href} onClick={isDataUri ? handleClick : undefined} className="block group h-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
