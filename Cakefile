fs            = require 'fs'
path          = require 'path'
{spawn, exec} = require 'child_process'

# Compile the app to Javascript.
task 'build', 'build the lib', ->
	child = exec("coffee -c -b index.coffee", (err, stdout, stderr) ->
    if err then console.log stderr.trim() else console.log '-- Build finished succesfully. --'
  )
	child.stdout.on 'data', (data) -> console.log data

# Test the app
task 'build:test', 'test the lib', ->
	child = exec('coffee -c -b test/', (err, stdout, stderr) ->
		if err then console.log stderr.trim() else console.log '-- Test built succesfully. --'
	)
