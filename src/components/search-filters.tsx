          {/* Features */}
          <div className="space-y-2">
            <Label>Features</Label>
            <Select
              value={filters.features[0] || 'any'}
              onValueChange={(value) => setFilter('features', value === 'any' ? [] : [value])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select features" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="Swimming Pool">Swimming Pool</SelectItem>
                <SelectItem value="Air Conditioning">Air Conditioning</SelectItem>
                <SelectItem value="Garage">Garage</SelectItem>
                <SelectItem value="Fenced">Fenced</SelectItem>
                {/* Add more features here */}
              </SelectContent>
            </Select>
          </div> 