for i in $(find lib -type f -name "*.d.ts");
  do sh -c "npx flowgen $i -o ${i%.*.*}.js.flow";
done;
