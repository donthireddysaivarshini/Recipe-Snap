
import RecipeCard from './RecipeCard';
import type { LocalSavedRecipe } from '@/lib/types';

interface RecipeListProps {
  recipes: LocalSavedRecipe[]; // Expecting recipe names and potentially source images
  title?: string;
  hideCardImage?: boolean; // New prop
}

export default function RecipeList({ recipes, title = "Suggested Recipes", hideCardImage = false }: RecipeListProps) {
  if (!recipes || recipes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-lg">{title === "Suggested Recipes" ? "No recipes generated yet. Try uploading an image!" : "No saved recipes found."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {title && <h2 className="text-2xl md:text-3xl font-headline font-semibold text-foreground">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, index) => (
          <RecipeCard key={`${recipe.name}-${index}`} recipe={recipe} hideImage={hideCardImage} />
        ))}
      </div>
    </div>
  );
}
