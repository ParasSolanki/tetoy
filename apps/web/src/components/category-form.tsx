import { zodResolver } from "@hookform/resolvers/zod";
import { updateCategorySchema } from "@tetoy/api/schema";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { SheetFooter } from "~/components/ui/sheet";
import { Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

type Category = z.infer<typeof updateCategorySchema>;

interface CategoryFormProps {
  category?: Category;
  schema: z.AnyZodObject;
  isPending: boolean;
  onSubmit: (values: unknown) => void;
}

export function CategoryForm({
  category,
  schema,
  isPending,
  onSubmit,
}: CategoryFormProps) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    values: {
      name: category?.name ?? "",
      subCategories: category?.subCategories ?? [{ name: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subCategories",
  });

  return (
    <Form {...form}>
      <form className="mt-4" onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset
          className="space-y-4"
          disabled={isPending}
          aria-disabled={isPending}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="px-6">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <ScrollArea className="max-h-80">
            <div className="space-y-4 pb-4">
              {fields.map((field, index) => (
                <div key={field.id} className="px-6">
                  <FormField
                    control={form.control}
                    name={`subCategories.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel>Sub category {`#${index + 1}`}</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-4">
                            <Input
                              {...field}
                              placeholder={`Sub category #${index + 1}`}
                            />

                            <div className="flex-grow">
                              {index === 0 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => append({ name: "" })}
                                >
                                  <PlusIcon className="size-4" />
                                </Button>
                              )}

                              {index !== 0 && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => remove(index)}
                                >
                                  <Trash2Icon className="size-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>

          <SheetFooter>
            <Button
              type="submit"
              disabled={isPending}
              aria-disabled={isPending}
            >
              {isPending && (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              )}
              Save
            </Button>
          </SheetFooter>
        </fieldset>
      </form>
    </Form>
  );
}
