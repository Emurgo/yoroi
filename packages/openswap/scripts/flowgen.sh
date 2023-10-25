for i in $(find dist -type f -name "*.d.ts");
  do sh -c "npx flowgen $i -o ${i%.*.*}.js.flow";
done;
