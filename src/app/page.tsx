"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Clipboard, Loader2, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateUniqueTranslations } from "@/ai/flows/generate-translations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty."),
  context: z.string().optional(),
});

type SavedContext = {
  name: string;
  value: string;
};

export default function Home() {
  const { toast } = useToast();
  const [translations, setTranslations] = useState<string[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [savedContexts, setSavedContexts] = useState<SavedContext[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [newContextName, setNewContextName] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      context: "",
    },
  });

  useEffect(() => {
    try {
      const storedContexts = localStorage.getItem("quadslator_contexts");
      if (storedContexts) {
        setSavedContexts(JSON.parse(storedContexts));
      }
    } catch (error) {
      console.error("Failed to load contexts from local storage", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load saved contexts from your browser.",
      });
    }
  }, [toast]);

  const handleSaveContext = () => {
    const currentContextValue = form.getValues("context");
    if (!newContextName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Context name cannot be empty.",
      });
      return;
    }
    if (!currentContextValue?.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Context field is empty. Nothing to save.",
        });
        return;
      }

    const newSavedContexts = [
      ...savedContexts,
      { name: newContextName, value: currentContextValue },
    ];
    setSavedContexts(newSavedContexts);
    try {
      localStorage.setItem(
        "quadslator_contexts",
        JSON.stringify(newSavedContexts)
      );
      toast({
        title: "Success",
        description: `Context "${newContextName}" saved.`,
      });
      setNewContextName("");
      setIsSaveDialogOpen(false);
    } catch (error) {
      console.error("Failed to save context to local storage", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save context to your browser.",
      });
    }
  };

  const handleDeleteContext = (contextNameToDelete: string) => {
    const newSavedContexts = savedContexts.filter(c => c.name !== contextNameToDelete);
    setSavedContexts(newSavedContexts);
    try {
      localStorage.setItem("quadslator_contexts", JSON.stringify(newSavedContexts));
      toast({
        title: "Context Deleted",
        description: `Context "${contextNameToDelete}" has been removed.`,
      });
    } catch (error) {
        console.error("Failed to delete context from local storage", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not delete context from your browser.",
        });
    }
  }

  const handleSelectContext = (contextName: string) => {
    const selected = savedContexts.find((c) => c.name === contextName);
    if (selected) {
      form.setValue("context", selected.value);
    }
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsTranslating(true);
    setTranslations([]);
    try {
      const result = await generateUniqueTranslations({
        prompt: values.prompt,
        context: values.context || "general",
      });
      setTranslations(result.translations);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Translation Error",
        description:
          "An error occurred while generating translations. Please try again.",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Translation copied to clipboard.",
      });
    }
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter text-primary">
          Quadslator
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Get four unique AI-powered translations for any prompt.
        </p>
      </div>

      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Your Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the text you want to translate..."
                        className="min-h-[120px] text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Context</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide some context for a better translation (e.g., 'formal email', 'casual chat', 'technical document')."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                 <Select onValueChange={handleSelectContext} disabled={savedContexts.length === 0}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Load a context" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedContexts.map((context) => (
                        <div key={context.name} className="flex items-center justify-between pr-2 relative">
                            <SelectItem value={context.name} className="w-full">
                                {context.name}
                            </SelectItem>
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 absolute right-1 top-1/2 -translate-y-1/2" onClick={(e) => {e.stopPropagation(); handleDeleteContext(context.name)}}>
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                
                <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <Save className="mr-2 h-4 w-4" /> Save Current Context
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Save Context</DialogTitle>
                      <DialogDescription>
                        Give this context a name to easily reuse it later.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newContextName}
                          onChange={(e) => setNewContextName(e.target.value)}
                          className="col-span-3"
                          placeholder="e.g., Business Emails"
                        />
                      </div>
                       <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right align-top pt-2">
                          Context
                        </Label>
                         <p className="col-span-3 text-sm text-muted-foreground border rounded-md p-2 h-24 overflow-y-auto bg-muted/50">
                            {form.getValues("context") || "No context provided."}
                         </p>
                       </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                      </DialogClose>
                      <Button type="button" onClick={handleSaveContext}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Button
            type="submit"
            size="lg"
            className="w-full text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={isTranslating}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isTranslating && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Translate
          </Button>
        </CardFooter>
      </Card>

      {isTranslating && (
        <div className="mt-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground mt-2">Generating translations...</p>
        </div>
      )}

      {translations.length > 0 && !isTranslating && (
        <div className="mt-8 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6 font-headline">
            Translation Results
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {translations.map((translation, index) => (
              <Card key={index} className="shadow-md transition-all hover:shadow-xl flex flex-col">
                <CardHeader>
                  <CardTitle>Translation #{index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-base">{translation}</p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(translation)}
                  >
                    <Clipboard className="mr-2 h-4 w-4" /> Copy
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
