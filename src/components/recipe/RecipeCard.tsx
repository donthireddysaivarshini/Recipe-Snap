
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Users, Image as ImageIcon } from 'lucide-react';
import type { LocalSavedRecipe } from '@/lib/types';
import { slugify } from '@/lib/utils'; // Import slugify

interface RecipeCardProps {
  recipe: LocalSavedRecipe;
  isLink?: boolean;
  hideImage?: boolean; // New prop
}

export default function RecipeCard({ recipe, isLink = true, hideImage = false }: RecipeCardProps) {
  const slug = slugify(recipe.name);
  // recipe.sourceImage on LocalSavedRecipe can be a data URI or a regular URL
  const isDataUri = recipe.sourceImage && recipe.sourceImage.startsWith('data:image/');
  const imageHint = isDataUri ? "food ingredients" : "recipe photo";

  const handleClick = (e: React.MouseEvent) => {
    if (isDataUri && typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.setItem(`tempImage_${slug}`, recipe.sourceImage!);
      } catch (err) {
        console.warn("Session storage not available for temp image. Detail page might not show user-uploaded image.", err);
      }
    }
  };

  let href = `/app/recipe/${slug}?name=${encodeURIComponent(recipe.name)}`;
  if (isDataUri) {
    href += `&tempImageKey=${slug}`;
  } else if (recipe.sourceImage) {
    href += `&image=${encodeURIComponent(recipe.sourceImage)}`;
  }

  const cardContent = (
    <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {!hideImage && (
        <CardHeader className="p-0">
          <div className="aspect-[4/3] relative w-full overflow-hidden">
            {recipe.sourceImage ? (
              <Image
                src={recipe.sourceImage}
                alt={`Image for ${recipe.name}`}
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
        <CardDescription className="text-sm line-clamp-3">
          A delightful dish made from the provided ingredients. Perfect for a quick meal.
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <div className="flex justify-between items-center w-full text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>~30 min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>2-4 servings</span>
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
