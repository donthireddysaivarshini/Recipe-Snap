import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Users, Image as ImageIcon } from 'lucide-react';
import type { LocalSavedRecipe } from '@/lib/types'; // Using this for consistency as it has name and sourceImage

interface RecipeCardProps {
  recipe: LocalSavedRecipe; // The AI returns recipe names, which we treat as LocalSavedRecipe structure
  isLink?: boolean;
}

// Helper to create a slug from a recipe name
const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

export default function RecipeCard({ recipe, isLink = true }: RecipeCardProps) {
  const cardContent = (
    <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <CardHeader className="p-0">
        <div className="aspect-[4/3] relative w-full overflow-hidden">
          {recipe.sourceImage ? (
            <Image
              src={recipe.sourceImage}
              alt={`Ingredients for ${recipe.name}`}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="food ingredients"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ImageIcon size={48} className="text-muted-foreground" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-xl mb-2 line-clamp-2">{recipe.name}</CardTitle>
        {/* Mocked details since AI doesn't provide them */}
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
      <Link href={`/app/recipe/${slugify(recipe.name)}?name=${encodeURIComponent(recipe.name)}&image=${encodeURIComponent(recipe.sourceImage || '')}`} className="block group h-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
